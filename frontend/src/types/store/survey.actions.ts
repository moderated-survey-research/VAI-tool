import {
  AnswerResponseDTO,
  MessageResponseDTO,
  ResultResponseDTO,
  SectionResponseDTO,
  SubmissionResponseDTO,
} from "@/types/dtos";
import { ChatType, ChatModelType } from "@/types/chat";

export enum SurveyActionType {
  INITIALIZE = "INITIALIZE",
  NEXT_PAGE = "NEXT_PAGE",
  PREVIOUS_PAGE = "PREVIOUS_PAGE",
  SET_ANSWER = "SET_ANSWER",
  SET_RESULT = "SET_RESULT",
  SET_SECTION = "SET_SECTION",
  SET_AVATAR = "SET_AVATAR",
  CLOSE_CHAT = "CLOSE_CHAT",
  ADD_MESSAGE = "ADD_MESSAGE",
  ADD_MESSAGES = "ADD_MESSAGES",
  REMOVE_MESSAGE = "REMOVE_MESSAGE",
  REMOVE_LAST_USER_MESSAGE_FROM_CURRENT_CHAT = "REMOVE_LAST_USER_MESSAGE_FROM_CURRENT_CHAT",
  MESSAGE_TYPED = "MESSAGE_TYPED",
  FINAL_NOTE_SUBMITTED = "FINAL_NOTE_SUBMITTED",
  PRIVACY_CONSENT_GIVEN = "PRIVACY_CONSENT_GIVEN",
}

interface SurveyActionPayloads {
  [SurveyActionType.INITIALIZE]: { submission: SubmissionResponseDTO };
  [SurveyActionType.NEXT_PAGE]: null;
  [SurveyActionType.PREVIOUS_PAGE]: null;
  [SurveyActionType.SET_ANSWER]: { sectionId: number; questionId: number; answer: AnswerResponseDTO };
  [SurveyActionType.SET_RESULT]: { sectionId: number; result: ResultResponseDTO };
  [SurveyActionType.SET_SECTION]: { section: SectionResponseDTO };
  [SurveyActionType.SET_AVATAR]: { avatarId: string };
  [SurveyActionType.CLOSE_CHAT]: { modelType: ChatModelType; modelId: number; chatType: ChatType };
  [SurveyActionType.ADD_MESSAGE]: {
    modelType: ChatModelType;
    modelId: number;
    chatType: ChatType;
    message: MessageResponseDTO;
    isClosed: boolean;
    isThinking: boolean;
    messageToRemove: number | string | null;
  };
  [SurveyActionType.ADD_MESSAGES]: {
    modelType: ChatModelType;
    modelId: number;
    chatType: ChatType;
    messages: MessageResponseDTO[];
    isClosed: boolean;
    isThinking: boolean;
    messageToRemove: number | string | null;
  };
  [SurveyActionType.REMOVE_MESSAGE]: {
    modelType: ChatModelType;
    modelId: number;
    chatType: ChatType;
    messageToRemove: number | string;
    isClosed: boolean;
    isThinking: boolean;
  };
  [SurveyActionType.MESSAGE_TYPED]: {
    modelType: ChatModelType;
    modelId: number;
    chatType: ChatType;
    messageId: string | number;
  };
  [SurveyActionType.REMOVE_LAST_USER_MESSAGE_FROM_CURRENT_CHAT]: null;
  [SurveyActionType.FINAL_NOTE_SUBMITTED]: { modelType: ChatModelType; modelId: number; chatType: ChatType };
  [SurveyActionType.PRIVACY_CONSENT_GIVEN]: { privacyConsentGivenAt: string; expiresAt: string };
}

export type SurveyAction<T extends SurveyActionType = SurveyActionType> = T extends T
  ? {
      type: T;
      payload: SurveyActionPayloads[T];
    }
  : never;
