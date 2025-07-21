import HeygenLogo from "@/components/icons/HeygenLogo";
import { CardFooter } from "@nextui-org/react";
import { OpenAiLogo } from "@phosphor-icons/react";

interface Props {
  poweredBy: "OpenAI" | "HeyGen";
}

const ChatFooter: React.FC<Props> = ({ poweredBy }) => {
  return (
    <CardFooter className="flex justify-center items-center">
      <a
        className="flex items-center justify-center"
        href={poweredBy === "OpenAI" ? "https://openai.com/" : "https://heygen.com/"}
        target="_blank"
        rel="noopener noreferrer"
      >
        {poweredBy === "OpenAI" ? (
          <>
            Powered by <OpenAiLogo size={24} className="ml-2" />
          </>
        ) : (
          <>
            Powered by <HeygenLogo className="ml-2" />
          </>
        )}
      </a>
    </CardFooter>
  );
};

export default ChatFooter;
