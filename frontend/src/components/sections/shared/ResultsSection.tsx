import { FC, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ResultDataDTO } from "@/types/dtos";
import { BFI2SDomainEnum, SurveyQuestionnaireType, CFQDomainEnum, BFI2SFacetEnum } from "@/types/survey";
import DomainChart from "@/components/charts/DomainChart";
import DomainTabs from "@/components/other/DomainTabs";
import { DOMAIN_DESCRIPTIONS } from "@/lib/survey";

interface Props {
  result: ResultDataDTO;
  type: SurveyQuestionnaireType;
}

const DOMAIN_LABELS = {
  [SurveyQuestionnaireType.BFI2S]: {
    [BFI2SDomainEnum.EXTRAVERSION]: "Extraversion",
    [BFI2SDomainEnum.AGREEABLENESS]: "Agreeableness",
    [BFI2SDomainEnum.CONSCIENTIOUSNESS]: "Conscientiousness",
    [BFI2SDomainEnum.NEGATIVE_EMOTIONALITY]: "Negative Emotionality",
    [BFI2SDomainEnum.OPEN_MINDEDNESS]: "Open Mindedness",
  },
  [SurveyQuestionnaireType.CFQ]: {
    [CFQDomainEnum.FORGETFULNESS]: "Forgetfulness",
    [CFQDomainEnum.DISTRACTIBILITY]: "Distractibility",
    [CFQDomainEnum.FALSE_TRIGGERING]: "False Triggering",
  },
};

const FACET_LABELS = {
  [SurveyQuestionnaireType.BFI2S]: {
    [BFI2SFacetEnum.SOCIABILITY]: "Sociability",
    [BFI2SFacetEnum.ASSERTIVENESS]: "Assertiveness",
    [BFI2SFacetEnum.ENERGY_LEVEL]: "Energy Level",
    [BFI2SFacetEnum.COMPASSION]: "Compassion",
    [BFI2SFacetEnum.RESPECTFULNESS]: "Respectfulness",
    [BFI2SFacetEnum.TRUST]: "Trust",
    [BFI2SFacetEnum.ORGANIZATION]: "Organization",
    [BFI2SFacetEnum.PRODUCTIVENESS]: "Productiveness",
    [BFI2SFacetEnum.RESPONSIBILITY]: "Responsibility",
    [BFI2SFacetEnum.ANXIETY]: "Anxiety",
    [BFI2SFacetEnum.DEPRESSION]: "Depression",
    [BFI2SFacetEnum.EMOTIONAL_VOLATILITY]: "Emotional Volatility",
    [BFI2SFacetEnum.AESTHETIC_SENSITIVITY]: "Aesthetic Sensitivity",
    [BFI2SFacetEnum.INTELLECTUAL_CURIOSITY]: "Intellectual Curiosity",
    [BFI2SFacetEnum.CREATIVE_IMAGINATION]: "Creative Imagination",
  },
  [SurveyQuestionnaireType.CFQ]: {},
};

const mobileWindowWidthThreshold = 750;

const ResultsSection: FC<Props> = ({ result, type }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < mobileWindowWidthThreshold);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col w-full items-center">
      <DomainChart data={result} isMobile={isMobile} theme={theme ?? "light"} DOMAIN_LABELS={DOMAIN_LABELS[type]} />
      <DomainTabs
        data={result}
        DOMAIN_DESCRIPTIONS={DOMAIN_DESCRIPTIONS[type]}
        DOMAIN_LABELS={DOMAIN_LABELS[type]}
        FACET_LABELS={FACET_LABELS[type]}
      />
    </div>
  );
};

export default ResultsSection;
