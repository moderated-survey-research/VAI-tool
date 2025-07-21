import { ResultResponseDTO } from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useResultService = (token: string) => {
  const { fetchApi } = useApi();

  const completeSection = async (surveyId: number | string, sectionId: number) =>
    await fetchApi<ResultResponseDTO>(`/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/results`, token, {
      method: "POST",
    });

  return {
    completeSection,
  };
};
