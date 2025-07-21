import React from "react";
import { Button } from "@nextui-org/react";
import { ChatCircleDots } from "@phosphor-icons/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { Transition } from "@headlessui/react";

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobile: boolean;
}

const AvatarPopupButton: React.FC<Props> = ({ isCollapsed, setIsCollapsed }) => {
  const handleClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Transition
      key={`transition_avatar_popup_button`}
      appear={true}
      show={true}
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

export default AvatarPopupButton;
