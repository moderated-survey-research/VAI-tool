import { ChatRole } from "@/types/chat";
import { MessageResponseDTO } from "@/types/dtos";
import React, { useEffect, useState } from "react";
import { Card } from "@nextui-org/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  message: MessageResponseDTO;
  onMessageTyped: (messageId: string | number) => void;
}

const ChatMessage: React.FC<Props> = ({ message, onMessageTyped }) => {
  const [displayedContent, setDisplayedContent] = useState<string>("");

  useEffect(() => {
    if (message.shouldTypewrite) {
      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength++;
        setDisplayedContent(message.content.slice(0, currentLength));
        if (currentLength === message.content.length) {
          clearInterval(interval);
          onMessageTyped(message.id);
        }
      }, 25);

      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message, onMessageTyped]);

  return (
    <Card
      className={`flex w-fit max-w-[80%] p-3 overflow-visible text-small ${
        message.role === ChatRole.ASSISTANT ? "bg-content3" : "bg-primary-50 ml-auto"
      }`}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{displayedContent}</Markdown>
    </Card>
  );
};

export default React.memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.shouldTypewrite === nextProps.message.shouldTypewrite
  );
});
