import { useFormContext } from "react-hook-form";
import { ChooseYourAvatarRequestDTO } from "@/types/dtos";
import AvatarSlider from "@/components/forms/AvatarSlider";

interface Props {
  onSubmit: (data: ChooseYourAvatarRequestDTO) => void;
}

const ChooseYourAvatarForm: React.FC<Props> = ({ onSubmit }) => {
  const methods = useFormContext<ChooseYourAvatarRequestDTO>();

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <AvatarSlider name="avatarId" />
    </form>
  );
};

export default ChooseYourAvatarForm;
