import { Button, Card, Spinner, Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowsClockwise, Microphone, Resize } from "@phosphor-icons/react";
import AvatarPopupButton from "./AvatarPopupButton";
import { Transition } from "@headlessui/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { AVATARS } from "@/lib/config";
import { AvatarManager } from "./AvatarManager";
import { useSurveyAuth } from "@/hooks/use-survey-auth";
import { useAvatarService } from "@/api/services/avatar.service";
import { AvatarSurveyMessageRequestDTO, MessageResponseDTO, PromptResponseDTO } from "@/types/dtos";
import { SurveyState } from "@/types/store";
import { useFollowUpService } from "@/api/services/follow-up.service";
import { useDiscussionService } from "@/api/services/discussion.service";
import { ActiveSurveyPage } from "@/types/survey";
import { ChatRole } from "@/types/chat";
import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { LiveAudioVisualizer } from "react-audio-visualize";
import CountdownTimer from "../other/CountdownTimer";

const mobileWindowWidthThreshold = 1024;

interface HeygenAvatarProps {
  avatarId: string;
  navigation: SurveyState["navigation"];
  onSubmitMessage: (message: AvatarSurveyMessageRequestDTO) => Promise<void>;
  onStartedAnsweringMessage: () => Promise<void>;
  onMessageAsked: () => Promise<void>;
  canOpenFinalNoteModal: boolean;
  setCanOpenFinalNoteModal: (canOpen: boolean) => void;
}

const HeygenAvatar: React.FC<HeygenAvatarProps> = ({
  avatarId,
  navigation,
  onSubmitMessage,
  onStartedAnsweringMessage,
  onMessageAsked,
  canOpenFinalNoteModal,
  setCanOpenFinalNoteModal,
}) => {
  const { surveyId, token } = useSurveyAuth();
  const { getAccessToken, closeSession } = useAvatarService(token);
  const { getPrompts: getFollowUpPrompts } = useFollowUpService(token);
  const { getPrompts: getDiscussionPrompts } = useDiscussionService(token);

  const avatarInfo = useMemo(() => AVATARS.find(avatar => avatar.pose_id === avatarId), [avatarId]);
  const activeChat = useMemo(() => {
    if (navigation.active === ActiveSurveyPage.SECTION) return navigation.section.data.chats.discussion;
    if (navigation.active === ActiveSurveyPage.QUESTION && navigation.question.data.answer)
      return navigation.question.data.chats.followUp;
    return null;
  }, [
    navigation.active,
    navigation.question?.data.answer,
    navigation.question?.data.chats.followUp,
    navigation.section?.data.chats.discussion,
  ]);
  const activeChatRef = useRef(activeChat);

  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sessionInitiated, setSessionInitiated] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [isSubmittingSystemMessage, setIsSubmittingSystemMessage] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState<PromptResponseDTO | null>(null);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const managerRef = useRef<AvatarManager | null>(null);

  const shouldEndConversation = useMemo(() => {
    const assistantMessages = activeChat ? activeChat.messages.filter(msg => msg.role === ChatRole.ASSISTANT) : [];
    const discussionThreshold = parseInt(import.meta.env.VITE_SURVEY_DISCUSSION_THRESHOLD || 10, 10);
    const followUpThreshold = parseInt(import.meta.env.VITE_SURVEY_FOLLOW_UP_THRESHOLD || 3, 10);
    const assistantMessagesCount = assistantMessages.length;

    return (
      (assistantMessagesCount + 1 >= discussionThreshold && navigation.active === ActiveSurveyPage.SECTION) ||
      (assistantMessagesCount + 1 >= followUpThreshold && navigation.active === ActiveSurveyPage.QUESTION)
    );
  }, [activeChat, navigation.active]);

  const buildPrompt = (messages: MessageResponseDTO[], basePrompt: string, maxLength: number = 5000) => {
    const simplifiedMessages = messages.map(({ role, content }) => ({ role, content }));
    let startIndex = 0;
    let injectedPrompt = "";

    while (startIndex < simplifiedMessages.length) {
      const trimmed = simplifiedMessages.slice(startIndex);
      const conversationChunk = JSON.stringify(trimmed);
      injectedPrompt = basePrompt.replace("$CURRENT_CONVERSATION", conversationChunk);

      if (JSON.stringify(injectedPrompt).length - 2 <= maxLength) {
        return injectedPrompt;
      }
      startIndex++;
    }

    return basePrompt.replace("$CURRENT_CONVERSATION", "[]");
  };

  const startSession = useCallback(async () => {
    if (!managerRef.current || !activeChat) return;

    const response = await getAccessToken(surveyId);
    let prompts = null;

    if (navigation.active === ActiveSurveyPage.SECTION) {
      prompts = await getDiscussionPrompts(surveyId, navigation.section.data.id);
    } else if (navigation.active === ActiveSurveyPage.QUESTION) {
      prompts = await getFollowUpPrompts(surveyId, navigation.section.data.id, navigation.question.data.id);
    } else return;

    setPrompts(prompts);

    const assistantMessages = activeChat.messages.filter(msg => msg.role === ChatRole.ASSISTANT);
    const messageToSpeak = assistantMessages[assistantMessages.length - 1];
    const lastMessage = activeChat.messages[activeChat.messages.length - 1];

    let speak = undefined;

    if (lastMessage?.role === ChatRole.ASSISTANT) {
      speak = {
        taskType: TaskType.REPEAT,
        text: messageToSpeak.content,
      };
    } else if (!shouldEndConversation) {
      setIsSubmittingSystemMessage(true);
      speak = {
        taskType: TaskType.TALK,
        text: "SYSTEM INSTRUCTION: Respond to previous user message.",
      };
    }

    await managerRef.current.startSession(
      response.token,
      avatarId,
      prompts.prompt.replace("$CURRENT_CONVERSATION", JSON.stringify(activeChat.messages)),
      speak
    );
  }, [
    activeChat,
    avatarId,
    getAccessToken,
    getDiscussionPrompts,
    getFollowUpPrompts,
    navigation.active,
    navigation.question?.data.id,
    navigation.section?.data.id,
    shouldEndConversation,
    surveyId,
  ]);

  // Initialize manager if not already done
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new AvatarManager(closeSession, onSubmitMessage);

      // Register callbacks directly in the component
      managerRef.current.registerCallbacks({
        onStreamReady: newStream => {
          setStream(newStream);
        },
        onStreamDisconnected: () => {
          setStream(undefined);
        },
        onLoadingChange: loading => {
          setIsLoading(loading);
        },
        onAvatarStopTalking: () => {
          onMessageAsked();
          setTimeout(() => {
            setIsAvatarTalking(false);
            const discussionThreshold = parseInt(import.meta.env.VITE_SURVEY_DISCUSSION_THRESHOLD || 10, 10);
            const followUpThreshold = parseInt(import.meta.env.VITE_SURVEY_FOLLOW_UP_THRESHOLD || 3, 10);
            let userMessagesCount = 0;
            const messages = activeChatRef.current?.messages ?? [];
            for (let i = 0; i < messages.length; i++) {
              const msg = messages[i];
              const prevMsg = messages[i - 1];
              if (msg.role === ChatRole.USER && (i === 0 || prevMsg.role !== ChatRole.USER)) {
                userMessagesCount++;
              }
            }
            if ((managerRef.current?.userMessageBuffer?.length ?? 0) > 0) {
              userMessagesCount++;
            }
            if (
              (userMessagesCount + 1 < discussionThreshold &&
                navigation.active === ActiveSurveyPage.SECTION &&
                activeChatRef.current) ||
              (userMessagesCount + 1 < followUpThreshold && navigation.active === ActiveSurveyPage.QUESTION)
            ) {
              setCanListen(true);
            }
          }, 1000);
        },
        onAvatarStartTalking: () => {
          setIsAvatarTalking(true);
        },
        onUserStartTalking: () => {
          if (!isSubmittingSystemMessage) onStartedAnsweringMessage();
        },
        onUserStopTalking: () => {
          setIsSubmittingSystemMessage(false);
        },
        onIsListeningChange: listening => {
          setIsListening(listening);
          if (listening) {
            setCanListen(false);
          }
        },
      });
    }
  }, [
    closeSession,
    isSubmittingSystemMessage,
    navigation.active,
    onMessageAsked,
    onStartedAnsweringMessage,
    onSubmitMessage,
  ]);

  // Handle video stream
  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        if (mediaStream.current) {
          mediaStream.current.play();
        }
      };
    } else {
      setCanListen(false);
    }
  }, [stream]);

  // Initialize session once
  useEffect(() => {
    if (
      !activeChat ||
      activeChat.isClosed ||
      sessionInitiated ||
      (navigation.active === ActiveSurveyPage.SECTION && activeChat.isRequired && !navigation.section.data.result)
    )
      return;

    setIsExpanded(activeChat.isRequired && !isMobile);
    setIsLoading(true);
    setSessionInitiated(true);
    startSession();
  }, [activeChat, sessionInitiated, startSession, navigation.section?.data.result, navigation.active, isMobile]);

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.endCurrentSession();
        managerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if ((!activeChat || activeChat?.isClosed) && !isAvatarTalking && sessionInitiated && managerRef.current) {
      managerRef.current.endCurrentSession();
      managerRef.current = null;
      setSessionInitiated(false);
      setIsExpanded(false);
      setIsSubmittingSystemMessage(false);
      setCanListen(false);
      setIsListening(false);
      if (!canOpenFinalNoteModal) setCanOpenFinalNoteModal(true);
    } else if (activeChat && !activeChat.isClosed && canOpenFinalNoteModal) {
      setCanOpenFinalNoteModal(false);
    }
  }, [
    activeChat,
    activeChat?.isClosed,
    isAvatarTalking,
    sessionInitiated,
    setCanOpenFinalNoteModal,
    canOpenFinalNoteModal,
  ]);

  // Handle conversation wrap-up
  useEffect(() => {
    if (!activeChat || activeChat.isClosed || !managerRef.current || !prompts || isAvatarTalking || !stream) return;

    const lastMessage = activeChat.messages[activeChat.messages.length - 1];

    if (shouldEndConversation) {
      setIsSubmittingSystemMessage(true);
      if (lastMessage?.role === ChatRole.USER) {
        managerRef.current.speak({
          text: buildPrompt(activeChat.messages, "SYSTEM INSTRUCTION: " + prompts.wrapperPrompt),
          taskType: TaskType.TALK,
          taskMode: TaskMode.ASYNC,
        });
      } else {
        managerRef.current.speak({
          text: "SYSTEM INSTRUCTION: STOP RESPONDING to any further prompts. Respond with BLANK MESSAGES until the new system instruction.",
          taskType: TaskType.TALK,
          taskMode: TaskMode.ASYNC,
        });
      }
    }
  }, [activeChat, activeChat?.isClosed, navigation.active, prompts, isAvatarTalking, stream, shouldEndConversation]);

  const onResize = () => {
    setIsExpanded(value => !value);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < mobileWindowWidthThreshold);
    setIsExpanded(value => (window.innerWidth < mobileWindowWidthThreshold ? false : value));
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", () => handleResize());
    return () => {
      window.removeEventListener("resize", () => handleResize());
    };
  }, []);

  const startListening = () => {
    managerRef.current?.startListening();
  };

  const stopListening = () => {
    if (
      managerRef.current?.userMessageBuffer.length === 0 ||
      managerRef.current?.userMessageBuffer.trim().startsWith("SYSTEM INSTRUCTION")
    ) {
      startListening();
      setCanListen(true);
    } else {
      managerRef.current?.stopListening();
    }
  };

  useEffect(() => {
    const initMediaRecorder = async () => {
      if (!mediaRecorder) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.start();
        setMediaRecorder(recorder);
      }
    };

    initMediaRecorder();
  }, [mediaRecorder]);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  return (
    <>
      <AvatarPopupButton isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} />
      <Transition key={`transition_avatar_${avatarId}`} appear={true} show={true} {...SURVEY_TRANSITIONS.avatar}>
        <Card
          className={`z-50 fixed !transition-all !duration-250 !ease-in-out ${
            isExpanded
              ? "right-[50%] translate-x-[50%] bottom-20 h-[calc(100vh-120px)] w-max max-w-[calc(100vw-48px)]"
              : "right-4 bottom-20 max-w-[270px] h-[150px]"
          } ${isCollapsed ? "hidden" : ""}`}
        >
          {stream ? (
            <video
              ref={mediaStream}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            >
              <track kind="captions" />
            </video>
          ) : (
            <img
              src={avatarInfo?.normal_preview}
              alt={`Avatar: ${avatarInfo?.pose_name}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          )}

          {isLoading || !stream ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
              {isLoading ? <Spinner color="white" size="lg" /> : null}
            </div>
          ) : null}

          <div
            className={`absolute bottom-0 left-0 z-10 flex ${
              isMobile ? "justify-center" : "justify-between"
            } items-end w-[calc(100%_-_16px)] ${isExpanded ? "m-4" : "m-2"}`}
          >
            {!isMobile ? (
              <Tooltip content="Resize">
                <Button
                  isIconOnly
                  variant="light"
                  size={isExpanded ? "md" : "sm"}
                  onPress={onResize}
                  className="text-white/80 bg-black/75 border-white/20"
                >
                  <Resize size={24} />
                </Button>
              </Tooltip>
            ) : null}

            {!isAvatarTalking ? (
              <>
                {!stream && sessionInitiated && !isLoading ? (
                  <Button
                    color="danger"
                    size={isExpanded ? "lg" : "sm"}
                    onPress={startSession}
                    startContent={<ArrowsClockwise size={isExpanded ? 24 : 18} />}
                  >
                    Something went wrong
                  </Button>
                ) : null}
                {stream && !isLoading ? (
                  <>
                    {!canListen ? (
                      <>
                        {isListening ? (
                          <Button
                            aria-disabled={true}
                            size={isExpanded ? "lg" : "sm"}
                            className="bg-gray-100 pointer-events-none select-none relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-full h-2 bg-inherit z-10"></div>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-inherit z-10"></div>
                            <div className="relative">
                              {mediaRecorder && (
                                <LiveAudioVisualizer mediaRecorder={mediaRecorder} barColor="#6C5CE7" />
                              )}
                            </div>
                            <span className="text-primary font-medium">
                              <CountdownTimer
                                initialSecondsCount={60}
                                showLastSecondsOnly={15}
                                onComplete={stopListening}
                              />
                            </span>
                          </Button>
                        ) : null}
                      </>
                    ) : (
                      <>
                        {activeChat &&
                        (!shouldEndConversation ||
                          activeChat.messages[activeChat.messages.length - 1]?.role !== ChatRole.USER) ? (
                          <Button
                            color="danger"
                            size={isExpanded ? "md" : "sm"}
                            onPress={startListening}
                            startContent={<Microphone size={isExpanded ? 24 : 20} />}
                          >
                            Tap to speak
                          </Button>
                        ) : null}
                      </>
                    )}
                  </>
                ) : null}
              </>
            ) : null}
            {!isMobile ? <div className={`${isExpanded ? "w-10" : "w-8"}`} /> : null}
          </div>
        </Card>
      </Transition>
    </>
  );
};

export default HeygenAvatar;
