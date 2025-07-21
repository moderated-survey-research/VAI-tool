import { useApi } from "@/api/utils/api";

export const useChatSessionService = (token: string) => {
  const { fetchApi } = useApi();

  const startedAnsweringMessage = async (surveyId: number | string, chatId: number, messageId: number | string) =>
    await fetchApi(`/api/v1/surveys/${surveyId}/submissions/chats/${chatId}/messages/${messageId}/answering`, token, {
      method: "POST",
    });

  const messageAsked = async (surveyId: number | string, chatId: number, messageId: number | string) =>
    await fetchApi(`/api/v1/surveys/${surveyId}/submissions/chats/${chatId}/messages/${messageId}/asked`, token, {
      method: "POST",
    });

  return {
    startedAnsweringMessage,
    messageAsked,
  };
};
