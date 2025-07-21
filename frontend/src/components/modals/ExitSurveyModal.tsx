import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import React from "react";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  onExit: () => void;
}

const ExitSurveyModal: React.FC<Props> = ({ isOpen, onOpenChange, onExit }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>Exit Survey</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to exit the survey? Your progress will not be saved, and you will lose any answers
                you've already provided. If you want to continue answering the survey, you can close this dialog and
                return to the survey.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button onPress={onExit} color="primary">
                Exit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExitSurveyModal;
