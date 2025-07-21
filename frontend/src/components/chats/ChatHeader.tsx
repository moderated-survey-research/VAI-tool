import { Button, CardHeader, Tooltip } from "@nextui-org/react";
import React from "react";
import { CaretDown } from "@phosphor-icons/react";

interface Props {
  isMobile: boolean;
  onCollapse: () => void;
  heading?: string;
}

const ChatHeader: React.FC<Props> = ({ onCollapse, heading = "Your AI Assistant" }) => {
  return (
    <CardHeader className="flex items-center justify-between px-4 bg-primary text-primary-foreground">
      <p className="text-large">🤖 {heading}</p>
      <Tooltip content="Minimize" placement="bottom">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onCollapse}
          className="text-primary-foreground border-primary-foreground hover:bg-primary-600"
        >
          <CaretDown size={24} />
        </Button>
      </Tooltip>
    </CardHeader>
  );
};

export default ChatHeader;
