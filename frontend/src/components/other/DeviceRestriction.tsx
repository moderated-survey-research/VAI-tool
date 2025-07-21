import SurveyLayout from "@/layouts/SurveyLayout";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import React, { useEffect, useState } from "react";
import { isDesktop } from "react-device-detect";
import { Transition } from "@headlessui/react";

interface Props {
  children: React.ReactNode;
}

const DeviceRestriction: React.FC<Props> = ({ children }) => {
  const [isDesktopSize, setIsDesktopSize] = useState(window.innerWidth >= 1024);

  const handleResize = () => {
    setIsDesktopSize(window.innerWidth >= 1024);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", () => handleResize());
    return () => {
      window.removeEventListener("resize", () => handleResize());
    };
  }, []);

  if (!isDesktopSize || !isDesktop) {
    return (
      <SurveyLayout>
        <Transition key={`transition_error`} appear={true} show={true} {...SURVEY_TRANSITIONS.ease_in_out_500}>
          <div className="flex flex-col flex-1 mx-auto items-center justify-center p-4">
            <div className="p-8 justify-center items-center text-center max-w-screen-sm max-md:pt-16 md:bg-content3 md:rounded-large md:shadow-md">
              <h1 className="text-2xl font-medium mb-4">📵 Ooups! This page isn't available on mobile.</h1>
              <p className="text-large text-secondary/70">
                We're sorry but this survey is only accessible on desktop devices. Please switch to a computer to
                participate.
              </p>
            </div>
          </div>
        </Transition>
      </SurveyLayout>
    );
  }

  return <>{children}</>;
};

export default DeviceRestriction;
