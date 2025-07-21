import { ChatRole } from "../chat";

export interface ChoiceRequestDTO {
  content: string | null;
  optionId: number;
}

export interface AnswerRequestDTO {
  content: string | boolean | number | null;
  explanation: string | null;
  choices: ChoiceRequestDTO[] | null;
}

export interface ClassicSurveyMessageRequestDTO {
  content: string;
}

export interface FinalNoteRequestDTO {
  content: string | null;
}

export interface AvatarSurveyMessageRequestDTO {
  content: string;
  role: ChatRole;
}

export interface ChooseYourAvatarRequestDTO {
  avatarId: string;
}

export interface InitiateSurveyRequestDTO {
  fingerprint: string;
  guid: string | null;
}
