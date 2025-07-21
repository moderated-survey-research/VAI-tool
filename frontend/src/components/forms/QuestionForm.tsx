import { useFormContext, useWatch } from "react-hook-form";
import { AnswerRequestDTO, QuestionResponseDTO } from "@/types/dtos";
import QuestionRenderer from "./questions/QuestionRenderer";
import { QuestionTypeEnum } from "@/types/survey";
import { useEffect, useMemo, useRef } from "react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { Transition } from "@headlessui/react";
import InputField from "./questions/InputField";

interface Props {
  question: QuestionResponseDTO;
  onSubmit: (data: AnswerRequestDTO) => void;
}

const QuestionForm: React.FC<Props> = ({ question, onSubmit }) => {
  const methods = useFormContext<AnswerRequestDTO>();
  const { register, unregister, control, handleSubmit } = methods;

  const explanationRef = useRef<HTMLTextAreaElement>(null);

  const watchedValues = useWatch({ control });
  const isReadyForExplanation = useMemo(() => {
    const answer = watchedValues?.choices || watchedValues.content;
    return !!answer;
  }, [watchedValues]);

  useEffect(() => {
    if (isReadyForExplanation) {
      explanationRef.current?.focus();
    }
  }, [isReadyForExplanation]);

  useEffect(() => {
    if (isReadyForExplanation) {
      register("explanation", { required: true });
    } else {
      unregister("explanation");
    }
  }, [isReadyForExplanation, register, unregister]);

  const transitionKey = useMemo(() => {
    switch (question.type) {
      case QuestionTypeEnum.INPUT:
        return `input`;
      case QuestionTypeEnum.TEXTAREA:
        return `textarea`;
      case QuestionTypeEnum.NUMERIC:
        return `numeric`;
      case QuestionTypeEnum.CHECKBOX:
        return `checkbox_${question.id}`;
      case QuestionTypeEnum.RADIO:
        return `radio_${question.id}`;
      case QuestionTypeEnum.BOOLEAN:
        return `boolean`;
      case QuestionTypeEnum.SCALE:
        return `scale_${question.scale?.id}`;
    }
  }, [question.id, question.scale?.id, question.type]);

  return (
    <Transition
      key={`transition_question_${transitionKey}`}
      appear={true}
      show={true}
      {...SURVEY_TRANSITIONS.ease_in_out_500}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-full">
        <div className="w-full md:w-2/3">
          <QuestionRenderer question={question} />
        </div>

        {question.requiresExplanation && isReadyForExplanation ? (
          <Transition
            key={`transition_question_explanation_${transitionKey}`}
            appear={true}
            show={true}
            {...SURVEY_TRANSITIONS.ease_in_out_500}
          >
            <div className="w-full md:w-2/3 pt-8">
              <p className="mb-2 font-medium text-start">
                Please explain the reasoning behind your answer in more detail:
              </p>
              <InputField
                name={"explanation"}
                type={QuestionTypeEnum.TEXTAREA}
                textAreaProps={{
                  variant: "bordered",
                  color: "primary",
                  classNames: { inputWrapper: "bg-content1" },
                  ref: explanationRef,
                  placeholder: "Your answer here (required)",
                }}
              />
            </div>
          </Transition>
        ) : null}
      </form>
    </Transition>
  );
};

export default QuestionForm;
