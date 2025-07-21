import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { Button, Spinner } from "@nextui-org/react";
import { SurveyType } from "@/types/survey";

interface Props {
  surveyType?: SurveyType;
  onSubmit: () => Promise<void>;
}

const PrivacyConsentPage: React.FC<Props> = ({ onSubmit, surveyType }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-center">
      <Transition
        key={`transition_privacy_consent`}
        appear={true}
        show={true}
        as="div"
        {...SURVEY_TRANSITIONS.ease_in_out_500}
      >
        <h1 className="text-3xl font-medium mb-10">To continue we need your consent to process your data 📃🖊️</h1>
        <p>
          {surveyType === SurveyType.CLASSIC
            ? 'To proceed, we require your explicit consent for your participation and processing of your data (questionnaire responses). Please be assured that your responses will remain fully anonymous and will only be used for research purposes. No personally identifiable information will be collected or stored. By clicking "I Agree", you provide your full and voluntary consent to the collection, processing and publication of your anonymized data.'
            : null}
          {surveyType === SurveyType.AVATAR
            ? 'To proceed, we require your explicit consent for your participation and processing of your data (questionnaire responses, voice recordings). Please be assured that your responses will remain fully anonymous and will only be used for research purposes. No personally identifiable information will be collected or stored. By clicking "I Agree", you provide your full and voluntary consent to the collection, processing and publication of your anonymized data.'
            : null}
        </p>
        <div className="flex justify-center mt-16">
          <Button
            onPress={submit}
            size="lg"
            color="primary"
            className="w-[200px] font-medium"
            isDisabled={isSubmitting}
            endContent={isSubmitting ? <Spinner color="white" size="sm" /> : null}
          >
            I Agree
          </Button>
        </div>
      </Transition>
    </div>
  );
};

export default PrivacyConsentPage;
