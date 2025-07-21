import { useController, UseControllerProps, useFormContext } from "react-hook-form";
import { ChoiceRequestDTO, OptionResponseDTO } from "@/types/dtos";
import { useState } from "react";
import { Checkbox, CheckboxGroup, cn, Input } from "@nextui-org/react";

interface Props extends UseControllerProps {
  options: OptionResponseDTO[];
}

const CheckboxField: React.FC<Props> = ({ options, name = "choices", ...props }) => {
  const { formState } = useFormContext();
  const { field } = useController({ ...props, name });
  const [inputValues, setInputValues] = useState<Record<number, string>>(
    () =>
      field.value?.reduce((acc: Record<number, string>, choice: ChoiceRequestDTO) => {
        if (choice.optionId && choice.content) {
          acc[choice.optionId] = choice.content;
        }
        return acc;
      }, {}) ?? {}
  );

  const handleCheckboxChange = (values: string[]) => {
    const selectedOptionIds = values.map(id => Number(id));
    const updatedChoices = options
      .filter(option => selectedOptionIds.includes(option.id))
      .map(option => ({
        optionId: option.id,
        content: inputValues[option.id] || null,
      }));

    field.onChange(updatedChoices);
  };

  const handleInputChange = (optionId: number, content: string) => {
    setInputValues(prev => ({ ...prev, [optionId]: content }));
    const updatedValue = (field.value ?? []).map((choice: ChoiceRequestDTO) =>
      choice.optionId === optionId ? { ...choice, content } : choice
    );
    field.onChange(updatedValue);
  };

  return (
    <CheckboxGroup
      isDisabled={formState.disabled || formState.isSubmitting}
      value={field.value?.map((choice: ChoiceRequestDTO) => String(choice.optionId)) || []}
      onChange={handleCheckboxChange}
      classNames={{
        wrapper: "gap-8 py-2",
      }}
    >
      {options.map(option => (
        <div key={option.id} className="flex flex-col w-full justify-center items-center gap-4">
          <Checkbox
            key={option.id}
            value={String(option.id)}
            classNames={{
              base: cn(
                "group flex w-full max-w-full items-center hover:opacity-70 active:opacity-50 tap-highlight-transparent",
                "cursor-pointer rounded-lg gap-4 p-4 transition-all shadow-sm",
                "bg-content1 hover:shadow-md hover:bg-content2",
                "data-[selected=true]:border-primary data-[selected=true]:bg-primary/10",
                "data-[disabled=true]:opacity-50"
              ),
              wrapper: "m-0",
              label: "flex flex-1 ml-0 mr-10 font-medium justify-center",
            }}
          >
            {option.content}
          </Checkbox>
          {option.requiresInput && field.value?.some((choice: ChoiceRequestDTO) => choice.optionId === option.id) ? (
            <Input
              isDisabled={!field.value?.some((choice: ChoiceRequestDTO) => choice.optionId === option.id)}
              size="sm"
              className="mb-2"
              type="text"
              value={inputValues[option.id] || ""}
              onValueChange={value => handleInputChange(option.id, value)}
              variant="underlined"
              placeholder="Please specify..."
            />
          ) : null}
        </div>
      ))}
    </CheckboxGroup>
  );
};

export default CheckboxField;
