import {
  AvatarSurveyMessageRequestDTO,
  ClassicSurveyMessageRequestDTO,
  FinalNoteRequestDTO,
  PromptResponseDTO,
  SendChatMessageResponseDTO,
} from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useDiscussionService = (token: string) => {
  const { fetchApi } = useApi();

  const getPrompts = async (surveyId: number | string, sectionId: number) =>
    await fetchApi<PromptResponseDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/chats/discussions/prompts`,
      token,
      {
        method: "GET",
      }
    );

  const sendMessage = async (surveyId: number | string, sectionId: number, request: ClassicSurveyMessageRequestDTO) =>
    await fetchApi<SendChatMessageResponseDTO, ClassicSurveyMessageRequestDTO | AvatarSurveyMessageRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/chats/discussions/messages`,
      token,
      {
        method: "POST",
        data: request,
      }
    );

  const closeChat = async (surveyId: number | string, sectionId: number) =>
    await fetchApi<SendChatMessageResponseDTO, ClassicSurveyMessageRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/chats/discussions/close`,
      token,
      {
        method: "POST",
      }
    );

  const sendFinalNote = async (surveyId: number | string, sectionId: number, request: FinalNoteRequestDTO) =>
    await fetchApi<undefined, FinalNoteRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/chats/discussions/final-notes`,
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
