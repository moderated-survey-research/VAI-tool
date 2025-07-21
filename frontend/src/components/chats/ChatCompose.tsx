import { Button, CardFooter, Tooltip } from "@nextui-org/react";
import { forwardRef, useEffect, useRef } from "react";
import { PaperPlaneRight, Resize } from "@phosphor-icons/react";
import { ClassicSurveyMessageRequestDTO } from "@/types/dtos";
import { useFormContext } from "react-hook-form";
import InputField from "@/components/forms/questions/InputField";
import { QuestionTypeEnum } from "@/types/survey";

interface Props {
  onResize: () => void;
  onSubmit: (data: ClassicSurveyMessageRequestDTO) => void;
  onStartedAnsweringMessage: () => Promise<void>;
  isMobile: boolean;
  isTypewriting: boolean;
}

const ChatCompose = forwardRef<HTMLFormElement, Props>(
  ({ onResize, onSubmit, isMobile, isTypewriting, onStartedAnsweringMessage }, ref) => {
    const methods = useFormContext<ClassicSurveyMessageRequestDTO>();
    const hasStartedAnswering = useRef(false);

    const contentValue = methods.watch("content");

    useEffect(() => {
      if (contentValue && !hasStartedAnswering.current) {
        hasStartedAnswering.current = true;
        onStartedAnsweringMessage();
      }
    }, [contentValue, hasStartedAnswering, onStartedAnsweringMessage]);

    return (
      <CardFooter className="bg-content1 p-4 my-2">
        <form
          ref={ref}
          className="flex gap-4 w-full items-center"
          onSubmit={methods.handleSubmit(data => {
            hasStartedAnswering.current = false;
            onSubmit(data);
          })}
        >
          {!isMobile && (
            <Tooltip content="Resize">
              <Button isIconOnly variant="light" onPress={onResize} color="secondary">
                <Resize size={24} />
              </Button>
            </Tooltip>
          )}
          <InputField
            name={"content"}
            type={QuestionTypeEnum.INPUT}
            inputProps={{ isClearable: true, color: "secondary", className: "text-white" }}
          />
          <Tooltip content="Send">
            <Button
              isIconOnly
              variant="light"
              onClick={methods.handleSubmit(data => {
                hasStartedAnswering.current = false;
                onSubmit(data);
              })}
              isLoading={methods.formState.isLoading || methods.formState.isSubmitting}
              isDisabled={!methods.formState.isValid || methods.formState.isSubmitting || isTypewriting}
              color="primary"
            >
              <PaperPlaneRight size={24} />
            </Button>
          </Tooltip>
        </form>
      </CardFooter>
    );
  }
);

export default ChatCompose;
