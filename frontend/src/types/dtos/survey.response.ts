import { QuestionTypeEnum, SectionTypeEnum, SurveyQuestionnaireType, SurveyType } from "@/types/survey";
import { ChatType, ChatRole } from "@/types/chat";

export interface ScaleResponseDTO {
  id: number;
  key: string;
  options: { [key: number]: string };
}

export interface MessageResponseDTO {
  id: number | string;
  content: string;
  role: ChatRole;
  shouldTypewrite?: boolean;
  isTypewrited?: boolean;
}

export interface ChoiceResponseDTO {
  id: number;
  content: string | null;
  optionId: number;
}

export interface AnswerResponseDTO {
  id: number;
  content: string | null;
  explanation: string | null;
  choices: ChoiceResponseDTO[];
}

export interface OptionResponseDTO {
  id: number;
  content: string;
  order: number;
  requiresInput: boolean;
}

export interface ChatResponseDTO {
  id: number;
  isRequired: boolean;
  isClosed: boolean;
  isThinking?: boolean;
  messages: MessageResponseDTO[];
  requiredMessagesCount: number | null;
  finalNote: string | null;
  finalNoteSubmittedAt: string | null;
}

export interface QuestionResponseDTO {
  id: number;
  preheading: string | null;
  content: string;
  subheading: string | null;
  key: string;
  type: QuestionTypeEnum;
  order: number;
  isRequired: boolean;
  answer: AnswerResponseDTO | null;
  chats: {
    [ChatType.FOLLOW_UP]: ChatResponseDTO | null;
  };
  options: OptionResponseDTO[];
  scale: ScaleResponseDTO | null;
  requiresExplanation: boolean;
}

export type DomainResultDataDTO = {
  score: number;
  facets?: {
    [key: string]: number;
  };
};

export type ResultDataDTO = {
  total?: number;
  domains: {
    [key: string]: DomainResultDataDTO;
  };
};

export interface ResultResponseDTO {
  id: number;
  data: ResultDataDTO | null;
  completedAt: string;
}

export interface QuestionnaireSectionResponseDTO {
  id: number;
  key: string;
  result: ResultResponseDTO | null;
}

export interface SectionResponseDTO {
  id: number;
  key: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  type: SectionTypeEnum;
  order: number;
  isRequired: boolean;
  isAiAssisted: boolean;
  result: ResultResponseDTO | null;
  questions: QuestionResponseDTO[];
  chats: {
    [key: string]: ChatResponseDTO | null;
  };
  questionnaireSection: QuestionnaireSectionResponseDTO | null;
}

export interface SubmissionResponseDTO {
  id: number;
  surveyId: number;
  avatarId: string | null;
  name: string;
  description: string;
  key: string;
  type: SurveyType;
  questionnaireType: SurveyQuestionnaireType;
  sections: SectionResponseDTO[];
  privacyConsentGivenAt: string | null;
  expiresAt: string | null;
}

export interface SurveyAuthResponseDTO {
  id: number;
  surveyId: number;
  token: string;
  expiresAt: string;
}

export interface SurveyPrivacyConsentResponseDTO {
  id: number;
  surveyId: number;
  privacyConsentGivenAt: string;
  expiresAt: string;
}

export interface SurveyAvatarTokenResponseDTO {
  token: string;
}

export interface SendChatMessageResponseDTO {
  id: number;
  isClosed: boolean;
  messages: MessageResponseDTO[];
}

export interface PromptResponseDTO {
  prompt: string;
  wrapperPrompt: string;
}
