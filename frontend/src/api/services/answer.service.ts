import { AnswerRequestDTO, AnswerResponseDTO } from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useAnswerService = (token: string) => {
  const { fetchApi } = useApi();

  const submitAnswer = async (surveyId: number | string, sectionId: number, questionId: number, request: AnswerRequestDTO) =>
    await fetchApi<AnswerResponseDTO, AnswerRequestDTO>(
      `/api/v1/surveys/${surveyId}/submissions/sections/${sectionId}/questions/${questionId}/answers`,
      token,
      {
        method: "POST",
        data: request,
      }
    );

  return {
    submitAnswer,
  };
};
