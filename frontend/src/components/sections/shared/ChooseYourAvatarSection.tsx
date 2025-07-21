import ChooseYourAvatarForm from "@/components/forms/ChooseYourAvatarForm";
import { ChooseYourAvatarRequestDTO } from "@/types/dtos";
import React from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";

export interface ChooseYourAvatarSectionProps {
  form: UseFormReturn<ChooseYourAvatarRequestDTO>;
  onSubmit: (data: ChooseYourAvatarRequestDTO) => void;
}

const ChooseYourAvatarSection: React.FC<ChooseYourAvatarSectionProps> = ({ form, onSubmit }) => {
  return (
    <FormProvider {...form}>
      <ChooseYourAvatarForm onSubmit={onSubmit} />
    </FormProvider>
  );
};

export default ChooseYourAvatarSection;
