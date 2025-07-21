export enum SectionTypeEnum {
  INFORMATION = "information",
  QUESTIONNAIRE = "questionnaire",
  RESULTS = "results",
}

export enum QuestionTypeEnum {
  INPUT = "input",
  TEXTAREA = "textarea",
  NUMERIC = "numeric",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  BOOLEAN = "boolean",
  SCALE = "scale",
}

export enum ActiveSurveyPage {
  NONE = "none",
  SECTION = "section",
  QUESTION = "question",
}

export enum SurveyType {
  CLASSIC = "classic",
  AVATAR = "avatar",
}

export enum SurveyQuestionnaireType {
  BFI2S = "bfi2s",
  CFQ = "cfq",
}

export enum CFQDomainEnum {
  FORGETFULNESS = "forgetfulness",
  DISTRACTIBILITY = "distractibility",
  FALSE_TRIGGERING = "falseTriggering",
}

export enum BFI2SDomainEnum {
  EXTRAVERSION = "extraversion",
  AGREEABLENESS = "agreeableness",
  CONSCIENTIOUSNESS = "conscientiousness",
  NEGATIVE_EMOTIONALITY = "negativeEmotionality",
  OPEN_MINDEDNESS = "openMindedness",
}

export enum BFI2SFacetEnum {
  SOCIABILITY = "sociability",
  ASSERTIVENESS = "assertiveness",
  ENERGY_LEVEL = "energyLevel",
  COMPASSION = "compassion",
  RESPECTFULNESS = "respectfulness",
  TRUST = "trust",
  ORGANIZATION = "organization",
  PRODUCTIVENESS = "productiveness",
  RESPONSIBILITY = "responsibility",
  ANXIETY = "anxiety",
  DEPRESSION = "depression",
  EMOTIONAL_VOLATILITY = "emotionalVolatility",
  AESTHETIC_SENSITIVITY = "aestheticSensitivity",
  INTELLECTUAL_CURIOSITY = "intellectualCuriosity",
  CREATIVE_IMAGINATION = "creativeImagination",
}

export enum AgentID {
  SECURITY = "security",
  SUMMARY = "summary",
  DISCUSSION = "discussion",
  FOLLOW_UP = "follow_up",
}
