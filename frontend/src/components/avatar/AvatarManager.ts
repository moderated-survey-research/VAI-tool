import StreamingAvatar, {
  AvatarQuality,
  SpeakRequest,
  StartAvatarResponse,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { logger } from "@/api/utils/logger";
import { heygenSessionStorage } from "@/utils/heygen.token";
import { AvatarSurveyMessageRequestDTO } from "@/types/dtos";
import { ChatRole } from "@/types/chat";

export interface AvatarEventCallbacks {
  onStreamReady?: (stream: MediaStream) => void;
  onStreamDisconnected?: () => void;
  onIsListeningChange?: (isListening: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onError?: (error: Error) => void;
  onAvatarStopTalking?: () => void;
  onAvatarStartTalking?: () => void;
  onUserStartTalking?: () => void;
  onUserStopTalking?: () => void;
}

export interface AvatarSessionInfo {
  sessionId: string;
  token: string;
}

export class AvatarManager {
  private avatar: StreamingAvatar | null = null;
  private sessionInfo: AvatarSessionInfo | null = null;
  private callbacks: AvatarEventCallbacks = {};
  private avatarLogger = logger.get("AVATAR");

  private closeSessionFn: (token: string, sessionId: string) => Promise<void>;
  private submitMessageFn: (message: AvatarSurveyMessageRequestDTO) => Promise<void>;

  // Message collection properties
  public userMessageBuffer: string = "";
  public avatarMessageBuffer: string = "";
  private lastUserActivity: number = 0;
  private lastAvatarActivity: number = 0;
  private ignoreNextUserMessage: boolean = false;
  private ignoreNextAvatarMessage: boolean = false;
  private messageTimeoutId: NodeJS.Timeout | null = null;
  private readonly MESSAGE_TIMEOUT_MS = 3000; // 3 seconds of silence considered end of message

  constructor(
    closeSessionFn: (token: string, sessionId: string) => Promise<void>,
    submitMessageFn: (message: AvatarSurveyMessageRequestDTO) => Promise<void>
  ) {
    this.closeSessionFn = closeSessionFn;
    this.submitMessageFn = submitMessageFn;
  }

  registerCallbacks = (callbacks: AvatarEventCallbacks): void => {
    this.callbacks = { ...this.callbacks, ...callbacks };
  };

  startSession = async (
    token: string,
    avatarId: string,
    knowledgeBase: string,
    speak?: {
      text: string;
      taskType: TaskType;
    }
  ): Promise<boolean> => {
    try {
      if (this.callbacks.onLoadingChange) {
        this.callbacks.onLoadingChange(true);
      }

      await this.endCurrentSession();

      this.avatar = new StreamingAvatar({ token });
      this.setupEventListeners();

      const sessionInfo: StartAvatarResponse = await this.avatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: avatarId,
        language: "en",
        voice: {
          emotion: VoiceEmotion.FRIENDLY,
        },
        knowledgeBase,
        disableIdleTimeout: true,
      });

      this.sessionInfo = {
        sessionId: sessionInfo.session_id,
        token,
      };

      heygenSessionStorage.saveSession(sessionInfo.session_id, token);

      await this.avatar?.startVoiceChat({ isInputAudioMuted: true, useSilencePrompt: false });

      if (speak) {
        await this.speak({
          taskType: speak.taskType,
          taskMode: TaskMode.ASYNC,
          text: speak.text,
        });
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error starting session");
      this.avatarLogger.error("Error starting avatar session:", err);

      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      return false;
    } finally {
      if (this.callbacks.onLoadingChange) {
        this.callbacks.onLoadingChange(false);
      }
    }
  };

  endCurrentSession = async (): Promise<void> => {
    try {
      this.clearMessageTimeout();

      // Submit any pending messages before closing
      this.submitPendingMessages();

      if (this.avatar) {
        await this.avatar.stopAvatar().catch(() => null);
        this.avatar = null;
      } else if (this.sessionInfo) {
        await this.closeSessionFn(this.sessionInfo.token, this.sessionInfo.sessionId).catch(() => null);
      } else {
        const storedSession = heygenSessionStorage.getSession();
        if (storedSession?.sessionId && storedSession.token) {
          await this.closeSessionFn(storedSession.token, storedSession.sessionId).catch(() => null);
        }
      }
    } catch (error) {
      this.avatarLogger.error("Error stopping avatar session:", error);
    } finally {
      this.resetMessageBuffers();
      this.sessionInfo = null;
      heygenSessionStorage.deleteSession();
    }
  };

  startListening = () => {
    this.avatar?.unmuteInputAudio();
    this.callbacks.onIsListeningChange?.(true);
  };

  stopListening = () => {
    this.avatar?.muteInputAudio();
    this.callbacks.onIsListeningChange?.(false);
  };

  speak = async (requestData: SpeakRequest): Promise<void> => {
    await this.avatar?.speak(requestData);
    if (requestData.taskType === TaskType.REPEAT) {
      this.ignoreNextAvatarMessage = true;
    } else {
      this.ignoreNextUserMessage = true;
    }
  };

  private setupEventListeners = (): void => {
    if (!this.avatar) return;

    // Handle any variant of avatar start talking event
    this.avatar.on(StreamingEvents.AVATAR_START_TALKING, async event => {
      this.avatarLogger.info("Avatar started talking", event);
      this.lastAvatarActivity = Date.now();
      this.stopListening();

      if (this.callbacks.onAvatarStartTalking) {
        this.callbacks.onAvatarStartTalking();
      }
    });

    // Handle avatar talking messages
    this.avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, async event => {
      this.avatarLogger.info("Avatar talking message", event);
      await this.handleAvatarTalkingMessage(event.detail?.message || "");
    });

    // Handle any variant of avatar stop talking event
    this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, async event => {
      this.avatarLogger.info("Avatar stopped talking", event);
      await this.finalizeAvatarMessage();

      if (this.callbacks.onAvatarStopTalking) {
        this.callbacks.onAvatarStopTalking();
      }
    });

    this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, async () => {
      this.avatarLogger.info("Stream disconnected");
      await this.submitPendingMessages();

      if (this.callbacks.onStreamDisconnected) {
        this.callbacks.onStreamDisconnected();
      }
    });

    this.avatar.on(StreamingEvents.STREAM_READY, event => {
      this.avatarLogger.info("Stream ready", event.detail);
      if (this.callbacks.onStreamReady) {
        this.callbacks.onStreamReady(event.detail);
      }
    });

    // Handle any variant of user start talking event
    this.avatar.on(StreamingEvents.USER_START, event => {
      this.avatarLogger.info("User started talking", event);
      this.lastUserActivity = Date.now();
      if (this.callbacks.onUserStartTalking) {
        this.callbacks.onUserStartTalking();
      }
    });

    // Handle user talking messages
    this.avatar.on(StreamingEvents.USER_TALKING_MESSAGE, async event => {
      this.avatarLogger.info("User talking message", event);
      await this.handleUserTalkingMessage(event.detail?.message || "");
    });

    // Handle any variant of user stop talking event
    this.avatar.on(StreamingEvents.USER_STOP, async event => {
      this.avatarLogger.info("User stopped talking", event);
      this.stopListening();
      await this.finalizeUserMessage();
      if (this.callbacks.onUserStopTalking) {
        this.callbacks.onUserStopTalking();
      }
    });
  };

  private handleUserTalkingMessage = async (text: string): Promise<void> => {
    // Finalize any pending avatar message first
    if (this.avatarMessageBuffer.length > 0 && Date.now() - this.lastAvatarActivity > this.MESSAGE_TIMEOUT_MS) {
      await this.finalizeAvatarMessage();
    }

    this.userMessageBuffer += text;
    this.lastUserActivity = Date.now();
    this.resetMessageTimeout();
  };

  private handleAvatarTalkingMessage = async (text: string): Promise<void> => {
    // Finalize any pending user message first
    if (this.userMessageBuffer.length > 0 && Date.now() - this.lastUserActivity > this.MESSAGE_TIMEOUT_MS) {
      await this.finalizeUserMessage();
    }

    this.avatarMessageBuffer += text;
    this.lastAvatarActivity = Date.now();
    this.resetMessageTimeout();
  };

  private finalizeUserMessage = async (): Promise<void> => {
    if (!this.userMessageBuffer.trim()) return;
    if (this.ignoreNextUserMessage) {
      this.userMessageBuffer = "";
      this.ignoreNextUserMessage = false;
      return;
    }

    const messageContent = this.userMessageBuffer.trim();
    this.userMessageBuffer = "";

    if (this.sessionInfo) {
      const message: AvatarSurveyMessageRequestDTO = {
        role: ChatRole.USER,
        content: messageContent,
      };

      this.avatarLogger.info(`Submitting user message: ${message.content}`);
      await this.submitMessageFn(message);
    }
  };

  private finalizeAvatarMessage = async (): Promise<void> => {
    if (!this.avatarMessageBuffer.trim()) return;
    if (this.ignoreNextAvatarMessage) {
      this.avatarMessageBuffer = "";
      this.ignoreNextAvatarMessage = false;
      return;
    }

    const messageContent = this.avatarMessageBuffer.trim();
    this.avatarMessageBuffer = "";

    if (this.sessionInfo) {
      const message: AvatarSurveyMessageRequestDTO = {
        role: ChatRole.ASSISTANT,
        content: messageContent,
      };

      this.avatarLogger.info(`Submitting avatar message: ${message.content}`);
      await this.submitMessageFn(message);
    }
  };

  private resetMessageTimeout = (): void => {
    this.clearMessageTimeout();

    // Set a timeout to finalize messages after a period of inactivity
    this.messageTimeoutId = setTimeout(() => {
      this.submitPendingMessages();
    }, this.MESSAGE_TIMEOUT_MS);
  };

  private clearMessageTimeout = (): void => {
    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
      this.messageTimeoutId = null;
    }
  };

  private submitPendingMessages = async (): Promise<void> => {
    if (this.userMessageBuffer.trim()) {
      await this.finalizeUserMessage();
    }

    if (this.avatarMessageBuffer.trim()) {
      await this.finalizeAvatarMessage();
    }
  };

  private resetMessageBuffers = (): void => {
    this.userMessageBuffer = "";
    this.avatarMessageBuffer = "";
    this.lastUserActivity = 0;
    this.lastAvatarActivity = 0;
  };
}
