import { useFormContext } from "react-hook-form";
import { ClassicSurveyMessageRequestDTO } from "@/types/dtos";
import InputField from "./questions/InputField";
import { QuestionTypeEnum } from "@/types/survey";

interface Props {
  onSubmit: (data: ClassicSurveyMessageRequestDTO) => void;
}

const FollowUpForm: React.FC<Props> = ({ onSubmit }) => {
  const methods = useFormContext<ClassicSurveyMessageRequestDTO>();

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="flex justify-center">
      <InputField name={"content"} type={QuestionTypeEnum.TEXTAREA} />
    </form>
  );
};

export default FollowUpForm;
