import React, { useState } from "react";
import { useController, UseControllerProps, useFormContext } from "react-hook-form";
import { Input, RadioGroup } from "@nextui-org/react";
import { OptionResponseDTO } from "@/types/dtos";
import CustomRadio from "./CustomRadio";

interface Props extends UseControllerProps {
  options: OptionResponseDTO[];
  className?: string;
}

const RadioField: React.FC<Props> = ({ options, name = "choices", ...props }) => {
  const { formState } = useFormContext();
  const { field } = useController({ ...props, name });
  const [inputValue, setInputValue] = useState<string | null>(field.value?.[0]?.content ?? null);

  const handleRadioChange = (optionId: number) => {
    const newValue = [{ optionId: optionId, content: inputValue }];
    field.onChange(newValue);
  };

  const handleInputChange = (content: string) => {
    setInputValue(content);
    field.onChange([{ optionId: field.value?.[0]?.optionId, content }]);
  };

  return (
    <RadioGroup
      isDisabled={formState.disabled || formState.isSubmitting}
      value={String(field.value?.[0]?.optionId)}
      onValueChange={value => handleRadioChange(Number(value))}
      classNames={{
        wrapper: "gap-4",
      }}
    >
      {options.map(option => (
        <div key={option.id} className="flex flex-col w-full justify-center items-center gap-2">
          <CustomRadio
            value={String(option.id)}
            classNames={{ label: "flex flex-row items-center justify-center gap-4" }}
          >
            {option.content}
          </CustomRadio>
          {option.requiresInput && field.value?.[0]?.optionId === option.id && (
            <Input
              isDisabled={formState.disabled || formState.isSubmitting}
              size="sm"
              type="text"
              value={inputValue ?? ""}
              onChange={e => handleInputChange(e.target.value)}
              variant="underlined"
              className="mb-2"
              placeholder="Please specify..."
            />
          )}
        </div>
      ))}
    </RadioGroup>
  );
};

export default RadioField;
