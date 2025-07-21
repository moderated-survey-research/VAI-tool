import { useController, UseControllerProps, useFormContext } from "react-hook-form";
import { QuestionTypeEnum } from "@/types/survey";
import { Input, InputProps, Textarea, TextAreaProps } from "@nextui-org/react";
import { useEffect, useRef } from "react";

interface Props extends UseControllerProps {
  placeholder?: string;
  type: QuestionTypeEnum;
  inputProps?: InputProps;
  textAreaProps?: TextAreaProps;
  className?: string;
  shouldFocus?: boolean;
}

const InputField: React.FC<Props> = ({
  type,
  textAreaProps = {},
  inputProps = {},
  className = "",
  placeholder = "Type something...",
  name = "content",
  shouldFocus = true,
  ...props
}) => {
  const { formState } = useFormContext();
  const { field } = useController({ ...props, name });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    switch (type) {
      case QuestionTypeEnum.TEXTAREA:
        if (textAreaRef.current && shouldFocus) {
          textAreaRef.current.focus();
        }
        break;
      default:
        if (inputRef.current && shouldFocus) {
          inputRef.current.focus();
        }
        break;
    }
  }, [shouldFocus, type]);

  const renderInput = () => {
    switch (type) {
      case QuestionTypeEnum.INPUT:
        return (
          <Input
            {...field}
            value={field.value ?? ""}
            onValueChange={value => field.onChange(value ?? null)}
            isDisabled={formState.disabled || formState.isSubmitting}
            placeholder={placeholder}
            className={className}
            {...inputProps}
            ref={inputRef}
            autoComplete="off"
            autoCorrect="off"
          />
        );
      case QuestionTypeEnum.TEXTAREA:
        return (
          <Textarea
            {...field}
            isDisabled={formState.disabled || formState.isSubmitting}
            placeholder={placeholder}
            value={formState.isDirty || name !== "content" ? field.value ?? "" : ""}
            onValueChange={value => field.onChange(value ?? null)}
            className={className}
            {...textAreaProps}
            ref={textAreaRef}
          />
        );
      case QuestionTypeEnum.NUMERIC:
        return (
          <Input
            {...field}
            isDisabled={formState.disabled || formState.isSubmitting}
            placeholder={placeholder}
            type="number"
            className={className}
            {...inputProps}
            ref={inputRef}
          />
        );
    }
  };

  return renderInput();
};

export default InputField;
