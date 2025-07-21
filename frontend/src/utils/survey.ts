import { SubmissionResponseDTO } from "@/types/dtos";
import { ActiveSurveyPage, SectionTypeEnum, SurveyType } from "@/types/survey";

const getInitialNavigation = (submission: SubmissionResponseDTO) => {
  let sectionIndex = -1;
  let questionIndex = -1;
  const incompleteSectionIndex = submission.sections.findIndex(
    section =>
      section.result === null ||
      (section.chats.discussion?.isRequired &&
        (!section.chats.discussion.isClosed ||
          (submission.type === SurveyType.AVATAR && !section.chats.discussion.finalNoteSubmittedAt)))
  );

  if (incompleteSectionIndex !== -1) {
    const incompleteSection = submission.sections[incompleteSectionIndex];
    if (incompleteSection.type === SectionTypeEnum.QUESTIONNAIRE && incompleteSection.questions.length > 0) {
      const unansweredQuestionIndex = incompleteSection.questions.findIndex(question => {
        return (
          question.answer == null ||
          (question.chats.followUp?.isRequired &&
            (!question.chats.followUp.isClosed ||
              (submission.type === SurveyType.AVATAR && !question.chats.followUp.finalNoteSubmittedAt)))
        );
      });
      if (unansweredQuestionIndex !== -1) questionIndex = unansweredQuestionIndex;
      else questionIndex = incompleteSection.questions.length - 1;
    }
    sectionIndex = incompleteSectionIndex;
  }

  const section = sectionIndex !== -1 ? submission.sections[sectionIndex] : null;
  const question = questionIndex !== -1 && section ? section.questions[questionIndex] : null;

  return {
    section: section
      ? {
          index: sectionIndex,
          data: section,
        }
      : null,
    question: question
      ? {
          index: questionIndex,
          data: question,
        }
      : null,
    active:
      section && question ? ActiveSurveyPage.QUESTION : section ? ActiveSurveyPage.SECTION : ActiveSurveyPage.NONE,
  };
};

export const surveyUtil = {
  getInitialNavigation,
};
