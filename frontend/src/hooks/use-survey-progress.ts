import { SubmissionResponseDTO } from "@/types/dtos";
import { SurveyState } from "@/types/store";
import { ActiveSurveyPage, SectionTypeEnum } from "@/types/survey";
import { useMemo } from "react";

export const useSurveyProgress = (submission: SubmissionResponseDTO | null, navigation: SurveyState["navigation"]) => {
  const totalSteps = useMemo(() => {
    return submission
      ? submission.sections.reduce((acc, section) => {
          if (section.type !== SectionTypeEnum.QUESTIONNAIRE) {
            return acc + 1;
          }
          return acc + section.questions.length;
        }, 0)
      : 0;
  }, [submission]);

  const currentStep = useMemo(() => {
    if (!submission) return 0;
    if (navigation.active === ActiveSurveyPage.SECTION) {
      const currentSectionIndex = navigation.section?.index ?? 0;
      return submission.sections.slice(0, currentSectionIndex).reduce((acc, section) => {
        return acc + (section.type === SectionTypeEnum.QUESTIONNAIRE ? section.questions.length : 1);
      }, 1);
    }
    if (navigation.active === ActiveSurveyPage.QUESTION) {
      const currentSectionIndex = navigation.section?.index ?? 0;
      const currentQuestionIndex = navigation.question?.index ?? 0;
      const stepsBeforeCurrentSection = submission.sections
        .slice(0, currentSectionIndex)
        .reduce(
          (acc, section) => acc + (section.type === SectionTypeEnum.QUESTIONNAIRE ? section.questions.length : 1),
          0
        );
      return stepsBeforeCurrentSection + currentQuestionIndex + 1;
    }
    return 0;
  }, [navigation.active, navigation.question?.index, navigation.section?.index, submission]);

  return { currentStep, totalSteps };
};
