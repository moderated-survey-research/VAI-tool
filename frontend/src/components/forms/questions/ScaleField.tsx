import { RadioGroup } from "@nextui-org/react";
import React from "react";
import { useController, UseControllerProps, useFormContext } from "react-hook-form";
import CustomRadio from "./CustomRadio";

interface Props extends UseControllerProps {
  options: { [key: number]: string };
}

const ScaleField: React.FC<Props> = ({ options, name = "content", ...props }) => {
  const { formState } = useFormContext();
  const { field } = useController({ ...props, name });

  return (
    <RadioGroup
      isDisabled={formState.disabled || formState.isSubmitting}
      value={String(field.value)}
      onValueChange={value => field.onChange(Number(value))}
      classNames={{
        wrapper: "gap-4",
      }}
    >
      {Object.keys(options)
        .sort((a, b) => Number(b) - Number(a))
        .map(key => (
          <CustomRadio key={key} value={key}>
            {options[Number(key)]}
          </CustomRadio>
        ))}
    </RadioGroup>
  );
};

export default ScaleField;
