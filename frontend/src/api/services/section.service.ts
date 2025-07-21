import { SectionResponseDTO } from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useSectionService = (token: string) => {
  const { fetchApi } = useApi();

  const getSection = async (surveyId: number | string, sectionId: number) =>
    await fetchApi<SectionResponseDTO>(`/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}`, token, {
      method: "GET",
    });

  return {
    getSection,
  };
};
