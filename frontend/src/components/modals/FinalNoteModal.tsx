import { FinalNoteRequestDTO } from "@/types/dtos";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import React from "react";
import { useFormContext } from "react-hook-form";
import InputField from "../forms/questions/InputField";
import { QuestionTypeEnum } from "@/types/survey";

interface Props {
  isOpen: boolean;
  onSubmit: (data: FinalNoteRequestDTO) => void;
  isSubmitting: boolean;
}

const FinalNoteModal: React.FC<Props> = ({ isOpen, onSubmit, isSubmitting }) => {
  const methods = useFormContext<FinalNoteRequestDTO>();

  return (
    <Modal isOpen={isOpen} isDismissable={false} size="lg" hideCloseButton>
      <ModalContent>
        <ModalHeader>
          <h1 className="text-2xl">Anything left unsaid? 🤔</h1>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex justify-center w-full">
            <div className="w-full">
              <InputField
                name={"content"}
                type={QuestionTypeEnum.TEXTAREA}
                textAreaProps={{
                  variant: "underlined",
                  color: "primary",
                  classNames: { inputWrapper: "bg-content1" },
                  size: "lg",
                }}
                placeholder="Type anything you didn't get to say (optional)…"
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isSubmitting}
            onPress={() => methods.handleSubmit(onSubmit)()}
            endContent={isSubmitting ? <Spinner color="white" size="sm" /> : null}
            color="primary"
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FinalNoteModal;
