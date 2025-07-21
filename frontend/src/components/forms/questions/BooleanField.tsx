import { RadioGroup } from "@nextui-org/react";
import { useController, UseControllerProps, useFormContext } from "react-hook-form";
import CustomRadio from "./CustomRadio";

const BooleanField: React.FC<UseControllerProps> = ({ name = "content", ...props }) => {
  const { formState } = useFormContext();
  const { field } = useController({ ...props, name });

  return (
    <RadioGroup
      isDisabled={formState.disabled || formState.isSubmitting}
      value={String(field.value)}
      onValueChange={value => field.onChange(value === "true")}
      classNames={{
        wrapper: "gap-4",
      }}
    >
      <CustomRadio value="true">Yes</CustomRadio>
      <CustomRadio value="false">No</CustomRadio>
    </RadioGroup>
  );
};

export default BooleanField;
