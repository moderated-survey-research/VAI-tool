import {
  AvatarSurveyMessageRequestDTO,
  ClassicSurveyMessageRequestDTO,
  FinalNoteRequestDTO,
  PromptResponseDTO,
  SendChatMessageResponseDTO,
} from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useFollowUpService = (token: string) => {
  const { fetchApi } = useApi();

  const getPrompts = async (surveyId: number | string, sectionId: number, questionId: number) =>
    await fetchApi<PromptResponseDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/questions/${questionId}/chats/follow-ups/prompts`,
      token,
      {
        method: "GET",
      }
    );

  const sendMessage = async (
    surveyId: number | string,
    sectionId: number,
    questionId: number,
    request: ClassicSurveyMessageRequestDTO
  ) =>
    await fetchApi<SendChatMessageResponseDTO, ClassicSurveyMessageRequestDTO | AvatarSurveyMessageRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/questions/${questionId}/chats/follow-ups/messages`,
      token,
      {
        method: "POST",
        data: request,
      }
    );

  const closeChat = async (surveyId: number | string, sectionId: number, questionId: number) =>
    await fetchApi<SendChatMessageResponseDTO, ClassicSurveyMessageRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/questions/${questionId}/chats/follow-ups/close`,
      token,
      {
        method: "POST",
      }
    );

  const sendFinalNote = async (
    surveyId: number | string,
    sectionId: number,
    questionId: number,
    request: FinalNoteRequestDTO
  ) =>
    await fetchApi<undefined, FinalNoteRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/questions/${questionId}/chats/follow-ups/final-notes`,
      token,
      {
        method: "POST",
        data: request,
      }
    );

  return {
    sendMessage,
    closeChat,
    getPrompts,
    sendFinalNote,
  };
};
