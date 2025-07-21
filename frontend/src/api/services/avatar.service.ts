import { SurveyAvatarTokenResponseDTO } from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useAvatarService = (baseToken: string) => {
  const { fetchApi: fetchBaseApi } = useApi("BASE");
  const { fetchApi: fetchHeygenApi } = useApi("HEYGEN");

  const setAvatar = async (surveyId: number | string, avatarId: string) =>
    await fetchBaseApi<SurveyAvatarTokenResponseDTO>(
      `/api/v1/surveys/${surveyId}/submissions/avatars/${avatarId}`,
      baseToken,
      {
        method: "POST",
      }
    );

  const getAccessToken = async (surveyId: number | string) =>
    await fetchBaseApi<SurveyAvatarTokenResponseDTO>(
      `/api/v1/surveys/${surveyId}/submissions/avatars/tokens`,
      baseToken,
      {
        method: "POST",
      }
    );

  const closeSession = async (token: string, sessionId: string) => {
    await fetchHeygenApi(`/v1/streaming.stop`, token, {
      method: "POST",
      data: {
        session_id: sessionId,
      },
    });
  };

  return {
    getAccessToken,
    setAvatar,
    closeSession,
  };
};
