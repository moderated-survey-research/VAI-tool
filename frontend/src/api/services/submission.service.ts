import {
  InitiateSurveyRequestDTO,
  SubmissionResponseDTO,
  SurveyAuthResponseDTO,
  SurveyPrivacyConsentResponseDTO,
} from "@/types/dtos";
import { useApi } from "@/api/utils/api";

export const useSubmissionService = (token: string | null) => {
  const { fetchApi } = useApi();

  const getSubmission = async (surveyId: number | string) =>
    await fetchApi<SubmissionResponseDTO>(`/api/v1/surveys/${surveyId}/submissions`, token);

  const completeSurvey = async (surveyId: number | string) =>
    await fetchApi(`/api/v1/surveys/${surveyId}/submissions/complete`, token, { method: "POST" });

  const initiateSurvey = async (surveyId: number | string, fingerprint: string, guid: string | null) =>
    await fetchApi<SurveyAuthResponseDTO, InitiateSurveyRequestDTO>(`/api/v1/surveys/${surveyId}/submissions`, null, {
      method: "POST",
      data: { fingerprint, guid },
    });

  const exitSurvey = async (surveyId: number | string) =>
    await fetchApi(`/api/v1/surveys/${surveyId}/submissions`, token, { method: "DELETE" });

  const privacyConsentGiven = async (surveyId: number | string) =>
    await fetchApi<SurveyPrivacyConsentResponseDTO>(`/api/v1/surveys/${surveyId}/submissions/privacy-consent`, token, {
      method: "POST",
    });

  return {
    getSubmission,
    completeSurvey,
    initiateSurvey,
    exitSurvey,
    privacyConsentGiven,
  };
};
