import { UseFormReturn } from "react-hook-form";
import { ChooseYourAvatarRequestDTO, SectionResponseDTO } from "@/types/dtos";
import React from "react";
import ChooseYourAvatarSection from "@/components/sections/shared/ChooseYourAvatarSection";
import { SECTION_KEYS, SECTION_MAP } from "@/lib/config";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import { Transition } from "@headlessui/react";
import { SectionTypeEnum, SurveyQuestionnaireType } from "@/types/survey";
import ResultsSection from "@/components/sections/shared/ResultsSection";
import MicrophoneCheckSection from "@/components/sections/shared/MicrophoneCheckSection";

interface Props {
  form: UseFormReturn<ChooseYourAvatarRequestDTO>;
  section: SectionResponseDTO;
  avatarId: string | null;
  onSubmit: (data: ChooseYourAvatarRequestDTO) => void;
  questionnaireType: SurveyQuestionnaireType;
  surveyKey: string;
}

const SectionPage: React.FC<Props> = ({ form, section, onSubmit, questionnaireType, surveyKey }) => {
  const getSectionElement = () => {
    const sectionElement = SECTION_MAP[surveyKey]?.[section.key];

    if (SECTION_KEYS.CHOOSE_YOUR_AVATARS.includes(section.key)) {
      return <ChooseYourAvatarSection form={form} onSubmit={onSubmit} />;
    } else if (SECTION_KEYS.MICROPHONE_CHECK.includes(section.key)) {
      return <MicrophoneCheckSection />;
    } else if (section.type === SectionTypeEnum.RESULTS) {
      if (!section.questionnaireSection?.result?.data) return null;
      return <ResultsSection type={questionnaireType} result={section.questionnaireSection.result.data} />;
    }

    return sectionElement;
  };

  return (
    <Transition
      key={`transition_section_${section.id}`}
      appear={true}
      show={true}
      {...SURVEY_TRANSITIONS.ease_in_out_500}
    >
      <div className="flex flex-col w-full mt-2 text-start">{getSectionElement()}</div>
    </Transition>
  );
};

export default SectionPage;
