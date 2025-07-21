import { useSurveyProgress } from "@/hooks/use-survey-progress";
import { SubmissionResponseDTO } from "@/types/dtos";
import { SurveyState } from "@/types/store";
import { Progress } from "@nextui-org/react";

interface Props {
  submission: SubmissionResponseDTO;
  navigation: SurveyState["navigation"];
  className?: string;
}

const SurveyProgressBar: React.FC<Props> = ({ submission, navigation, className = "" }) => {
  const { currentStep, totalSteps } = useSurveyProgress(submission, navigation);

  return (
    <Progress
      aria-label="Survey progress"
      value={currentStep}
      size="sm"
      radius="none"
      minValue={0}
      maxValue={totalSteps}
      className={className}
    />
  );
};

export default SurveyProgressBar;
