import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatResponseDTO, ClassicSurveyMessageRequestDTO } from "@/types/dtos";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./message/ChatMessage";
import ChatCompose from "./ChatCompose";
import { Card, CardBody } from "@nextui-org/react";
import ThinkingMessage from "./message/ThinkingMessage";
import { Transition } from "@headlessui/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { FormProvider, UseFormReturn } from "react-hook-form";
import ChatPopupButton from "./ChatPopupButton";

const mobileWindowWidthThreshold = 450;

interface Props {
  chat: ChatResponseDTO;
  form: UseFormReturn<ClassicSurveyMessageRequestDTO>;
  onSubmit: (message: ClassicSurveyMessageRequestDTO) => void;
  onMessageTyped: (messageId: string | number) => void;
  onStartedAnsweringMessage: () => Promise<void>;
  onMessageAsked: () => Promise<void>;
  canOpenFinalNoteModal: boolean;
  setCanOpenFinalNoteModal: (canOpen: boolean) => void;
}

const Chat: React.FC<Props> = ({
  chat,
  form,
  onSubmit,
  onMessageTyped,
  onStartedAnsweringMessage,
  onMessageAsked,
  canOpenFinalNoteModal,
  setCanOpenFinalNoteModal,
}) => {
  const adjustedChat = useMemo(() => {
    if (chat.messages.length === 1 && !chat.messages[0].shouldTypewrite && !chat.messages[0].isTypewrited) {
      return {
        ...chat,
        messages: [
          {
            ...chat.messages[0],
            shouldTypewrite: true,
          },
        ],
      };
    }
    return chat;
  }, [chat]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(adjustedChat.isClosed ? true : false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatComposeRef = useRef<HTMLFormElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onCollapse = () => {
    setIsCollapsed(true);
  };

  const onResize = () => {
    setIsExpanded(!isExpanded);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < mobileWindowWidthThreshold);
  };

  const onMessageTypedOverload = (messageId: string | number) => {
    onMessageTyped(messageId);
    onMessageAsked();
    if (chatComposeRef.current) {
      const inputEl = chatComposeRef.current.querySelector("input");
      inputEl?.focus();
    }
  };

  useEffect(() => {
    if (adjustedChat.isThinking === true) {
      scrollToBottom();
    }
  }, [adjustedChat.isThinking]);

  useEffect(() => {
    if (adjustedChat.messages?.[adjustedChat.messages.length - 1]?.shouldTypewrite === true) {
      const interval = setInterval(() => {
        scrollToBottom();
      }, 250);

      return () => clearInterval(interval);
    }
  }, [adjustedChat.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [adjustedChat.messages]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", () => handleResize());
    return () => {
      window.removeEventListener("resize", () => handleResize());
    };
  }, []);

  useEffect(() => {
    const isTypewriting = adjustedChat.messages?.[adjustedChat.messages.length - 1]?.shouldTypewrite === true;
    if (canOpenFinalNoteModal && isTypewriting) {
      setCanOpenFinalNoteModal(false);
    } else if (!canOpenFinalNoteModal && !isTypewriting) {
      setCanOpenFinalNoteModal(true);
    }
  }, [adjustedChat.messages, canOpenFinalNoteModal, setCanOpenFinalNoteModal]);

  return (
    <FormProvider {...form}>
      <ChatPopupButton isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} />
      <Transition
        key={`transition_chat_${adjustedChat.id}`}
        appear={true}
        show={!isCollapsed}
        {...SURVEY_TRANSITIONS.chat}
      >
        <Card
          className={`fixed overflow-hidden flex flex-col z-50 !transition-all !duration-250 !ease-in-out ${
            isMobile
              ? "w-screen h-screen right-0 bottom-0"
              : `max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] right-4 bottom-20 ${
                  isExpanded ? "w-[calc(100vw-48px)] h-[calc(100vh-120px)]" : "w-[450px] h-[650px]"
                }`
          }`}
          radius={isMobile ? "none" : "md"}
        >
          <ChatHeader isMobile={isMobile} onCollapse={onCollapse} />
          <CardBody className="flex flex-grow-1 flex-column gap-4 bg-content2 px-6">
            {adjustedChat.messages.map((message, index) => {
              return <ChatMessage key={index} message={message} onMessageTyped={onMessageTypedOverload} />;
            })}
            {adjustedChat.isThinking ? <ThinkingMessage /> : null}
            <div ref={messagesEndRef} />
          </CardBody>
          <ChatCompose
            onSubmit={onSubmit}
            onResize={onResize}
            onStartedAnsweringMessage={onStartedAnsweringMessage}
            isMobile={isMobile}
            isTypewriting={adjustedChat.messages?.[adjustedChat.messages.length - 1]?.shouldTypewrite === true}
            ref={chatComposeRef}
          />
        </Card>
      </Transition>
    </FormProvider>
  );
};

export default Chat;
