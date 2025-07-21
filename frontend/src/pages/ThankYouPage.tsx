import SurveyLayout from "@/layouts/SurveyLayout";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { Transition } from "@headlessui/react";

const ThankYouPage: React.FC = () => {
  return (
    <SurveyLayout>
      <Transition key={`transition_thank_you`} appear={true} show={true} {...SURVEY_TRANSITIONS.ease_in_out_500}>
        <div className="flex flex-col flex-1 mx-auto items-center justify-center p-4 text-center">
          <div className="p-12 max-w-screen-sm max-md:pt-16 md:bg-content3 md:rounded-large md:shadow-md">
            <h1 className="text-6xl font-medium mb-6">🎉Thank You!</h1>
            <h2 className="text-2xl font-light mb-4">Your response has been recorded.</h2>
            <p className="text-large text-secondary/70">We appreciate your time and effort in completing the survey.</p>
          </div>
        </div>
      </Transition>
    </SurveyLayout>
  );
};

export default ThankYouPage;
