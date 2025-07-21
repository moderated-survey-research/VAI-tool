import ExitSurveyModal from "@/components/modals/ExitSurveyModal";
// import CountdownTimer from "@/components/other/CountdownTimer";
import { useSurveyProgress } from "@/hooks/use-survey-progress";
import { SubmissionResponseDTO } from "@/types/dtos";
import { SurveyState } from "@/types/store";
import { Button, Navbar, NavbarContent, NavbarItem, Tooltip, useDisclosure } from "@nextui-org/react";
import { CaretLeft } from "@phosphor-icons/react";
// import { useEffect, useMemo, useState } from "react";

interface Props {
  submission: SubmissionResponseDTO | null;
  navigation: SurveyState["navigation"];
  onPrevious: () => void;
  onExit: () => void;
}

const SurveyHeader: React.FC<Props> = ({ submission, navigation, onPrevious, onExit }) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const hasPrevious = navigation.section?.index !== 0 || (navigation.question && navigation.question.index !== 0);
  const { currentStep, totalSteps } = useSurveyProgress(submission, navigation);
  // const remainingTime = useMemo(() => {
  //   return submission?.expiresAt ? (new Date(submission.expiresAt).getTime() - Date.now()) / 1000 : 0;
  // }, [submission?.expiresAt]);
  // const [isDesktopSize, setIsDesktopSize] = useState(window.innerWidth >= 1024);

  // const handleResize = () => {
  //   setIsDesktopSize(window.innerWidth >= 1024);
  // };

  // useEffect(() => {
  //   handleResize();
  //   window.addEventListener("resize", () => handleResize());
  //   return () => {
  //     window.removeEventListener("resize", () => handleResize());
  //   };
  // }, []);

  return (
    <>
      <Navbar className="pt-4 md:pt-8 bg-inherit px-0" position="static" isBlurred={false}>
        <NavbarContent justify="start">
          <NavbarItem>
            <Tooltip content="Previous" placement="bottom">
              <Button
                color="secondary"
                isIconOnly={true}
                isDisabled={!hasPrevious}
                onPress={onPrevious}
                variant="light"
                startContent={<CaretLeft size={24} />}
              ></Button>
            </Tooltip>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="center" className="flex-grow">
          <NavbarItem className="flex flex-col w-full jsutify-center items-center">
            <p className="text-medium text-center font-medium text-secondary">
              {currentStep} of {totalSteps}
            </p>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end" />
      </Navbar>
      <ExitSurveyModal isOpen={isOpen} onOpenChange={onOpenChange} onExit={onExit} />
      {/* <Card className={`fixed bg-content3 ${isDesktopSize ? "right-4 top-4" : "left-4 bottom-4"}`}>
        <CardHeader>
          {submission?.expiresAt ? <CountdownTimer initialSecondsCount={remainingTime} onComplete={onExit} /> : null}
        </CardHeader>
      </Card> */}
    </>
  );
};

export default SurveyHeader;
