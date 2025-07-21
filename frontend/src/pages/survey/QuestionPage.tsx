import { FormProvider, UseFormReturn } from "react-hook-form";
import QuestionForm from "@/components/forms/QuestionForm";
import React from "react";
import { AnswerRequestDTO, QuestionResponseDTO } from "@/types/dtos";
import { Transition } from "@headlessui/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";

interface Props {
  form: UseFormReturn<AnswerRequestDTO>;
  question: QuestionResponseDTO;
  avatarId: string | null;
  isAiAssisted: boolean;
  onSubmit: (data: AnswerRequestDTO) => void;
}

const QuestionPage: React.FC<Props> = ({ form, question, onSubmit }) => {
  return (
    <div className="w-full">
      <Transition
        key={`transition_question_title_${question.id}`}
        appear={true}
        show={true}
        as="div"
        {...SURVEY_TRANSITIONS.ease_in_out_500}
      >
        {question.preheading ? <h2 className="text-lg mb-2 text-secondary">{question.preheading}</h2> : null}
        <h1 className={`text-2xl font-medium text-secondary ${question.subheading ? "mb-2" : "mb-10"}`}>
          {question.content}
        </h1>
        {question.subheading ? <h2 className="text-large mb-10 text-secondary">{question.subheading}</h2> : null}
      </Transition>
      <FormProvider {...form}>
        <QuestionForm question={question} onSubmit={onSubmit} />
      </FormProvider>
    </div>
  );
};

export default QuestionPage;
