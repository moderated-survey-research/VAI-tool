import React from "react";
import { Card } from "@nextui-org/react";
import TripleDots from "./triple-dots/TripleDots";

const ThinkingMessage: React.FC = () => {
  return (
    <Card className="flex w-fit max-w-[80%] p-3 overflow-visible text-small bg-content3">
      <TripleDots />
    </Card>
  );
};

export default ThinkingMessage;
