import { QuestionResponseDTO, SectionResponseDTO, SubmissionResponseDTO } from "@/types/dtos";
import { ActiveSurveyPage } from "@/types/survey";

interface UninitializedSurveyState {
  initialized: false;
  submission: null;
  navigation: {
    active: ActiveSurveyPage.NONE;
    section: null;
    question: null;
  };
}

interface SurveyStateNone {
  initialized: true;
  submission: SubmissionResponseDTO;
  navigation: {
    active: ActiveSurveyPage.NONE;
    section: null;
    question: null;
  };
}

interface SurveyStateSection {
  initialized: true;
  submission: SubmissionResponseDTO;
  navigation: {
    active: ActiveSurveyPage.SECTION;
    section: {
      index: number;
      data: SectionResponseDTO;
    };
    question: null;
  };
}

interface SurveyStateQuestion {
  initialized: true;
  submission: SubmissionResponseDTO;
  navigation: {
    active: ActiveSurveyPage.QUESTION;
    section: {
      index: number;
      data: SectionResponseDTO;
    };
    question: {
      index: number;
      data: QuestionResponseDTO;
    };
  };
}

export type SurveyState = UninitializedSurveyState | SurveyStateNone | SurveyStateSection | SurveyStateQuestion;
