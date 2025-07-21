import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { Transition } from "@headlessui/react";
import { Button } from "@nextui-org/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  code: number;
  message?: string;
  canGoBack?: boolean;
}
const ErrorPage: React.FC<Props> = ({ code, message, canGoBack = true }) => {
  const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };

  const errorMessage = useMemo(() => {
    if (message) return message;

    switch (code) {
      case 404:
        return "The page you're looking for doesn't seem to exist. It might have been moved, renamed, or never existed in the first place.";
      default:
        return "An unexpected error has occurred while processing your request. Please try again later. We appreciate your patience and understanding.";
    }
  }, [code, message]);

  return (
    <Transition key={`transition_error`} appear={true} show={true} {...SURVEY_TRANSITIONS.ease_in_out_500}>
      <div className="flex flex-col flex-1 mx-auto items-center justify-center p-4">
        <div className="p-8 justify-center items-center text-center max-w-screen-sm max-md:pt-16 md:bg-content3 md:rounded-large md:shadow-md">
          <h1 className="text-6xl font-medium mb-6">💥{code}</h1>

          <h1 className="text-2xl font-light mb-4">Ooups, something went wrong...</h1>
          <p className="text-large text-secondary/70">{errorMessage}</p>
          {canGoBack ? (
            <Button size="lg" color="primary" className="mt-16 w-fit" onPress={onBack}>
              Back
            </Button>
          ) : null}
        </div>
      </div>
    </Transition>
  );
};

export default ErrorPage;
