import React from "react";
import { Button } from "@nextui-org/react";
import { ChatCircleDots } from "@phosphor-icons/react";
import { Transition } from "@headlessui/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobile: boolean;
}

const ChatPopupButton: React.FC<Props> = ({ isCollapsed, isMobile, setIsCollapsed }) => {
  const handleClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Transition
      key={`transition_chat_popup_button`}
      appear={true}
      show={isCollapsed || !isMobile}
      {...SURVEY_TRANSITIONS.ease_in_out_500}
    >
      <Button
        isIconOnly
        onPress={handleClick}
        className={`fixed bottom-4 right-4 w-[56px] h-[56px]`}
        color="secondary"
        variant="light"
      >
        <ChatCircleDots size={32} />
      </Button>
    </Transition>
  );
};

export default ChatPopupButton;
