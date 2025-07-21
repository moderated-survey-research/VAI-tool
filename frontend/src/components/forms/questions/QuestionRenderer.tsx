import { QuestionResponseDTO } from "@/types/dtos";
import { QuestionTypeEnum } from "@/types/survey";
import BooleanField from "./BooleanField";
import CheckboxField from "./CheckboxField";
import InputField from "./InputField";
import RadioField from "./RadioField";
import ScaleField from "./ScaleField";

interface QuestionRendererProps {
  question: QuestionResponseDTO;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  switch (question.type) {
    case QuestionTypeEnum.INPUT:
    case QuestionTypeEnum.TEXTAREA:
    case QuestionTypeEnum.NUMERIC:
      return (
        <InputField
          name={"content"}
          type={question.type}
          inputProps={{ variant: "bordered", color: "primary", classNames: { inputWrapper: "bg-content1" } }}
          textAreaProps={{ variant: "bordered", color: "primary", classNames: { inputWrapper: "bg-content1" } }}
        />
      );
    case QuestionTypeEnum.CHECKBOX:
      return <CheckboxField name={"choices"} options={question.options} />;
    case QuestionTypeEnum.RADIO:
      return <RadioField name={"choices"} options={question.options} />;
    case QuestionTypeEnum.BOOLEAN:
      return <BooleanField name={"content"} />;
    case QuestionTypeEnum.SCALE:
      if (!question.scale) return null;
      return <ScaleField name={"content"} options={question.scale.options} />;
    default:
      return null;
  }
};

export default QuestionRenderer;
