import * as yup from "yup";
import { QuestionTypeEnum } from "@/types/survey";
import {
  AnswerRequestDTO,
  ChooseYourAvatarRequestDTO,
  ClassicSurveyMessageRequestDTO,
  FinalNoteRequestDTO,
  QuestionResponseDTO,
} from "@/types/dtos";
import { AVATARS } from "@/lib/config";

const generateChooseYourAvatarValidationSchema = (): yup.ObjectSchema<ChooseYourAvatarRequestDTO> => {
  return yup.object({
    avatarId: yup
      .string()
      .oneOf(AVATARS.map(avatar => avatar.pose_id))
      .required()
      .default(null)
      .trim()
      .transform(value => (value !== "" ? value : null)),
  });
};

const generateQuestionValidationSchema = (
  question?: QuestionResponseDTO | null
): yup.ObjectSchema<AnswerRequestDTO> => {
  switch (question?.type) {
    case QuestionTypeEnum.INPUT:
    case QuestionTypeEnum.TEXTAREA:
      return yup.object({
        content: yup
          .string()
          .when([], {
            is: () => question.isRequired,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .when([], {
            is: () => question.requiresExplanation,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .nullable()
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .nullable()
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
    case QuestionTypeEnum.NUMERIC:
      return yup.object({
        content: yup
          .number()
          .when([], {
            is: () => question.isRequired,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .min(-1000000)
          .max(1000000)
          .default(null)
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .when([], {
            is: () => question.requiresExplanation,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .nullable()
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .nullable()
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
    case QuestionTypeEnum.CHECKBOX:
      return yup.object({
        content: yup
          .string()
          .nullable()
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .when([], {
            is: () => question.requiresExplanation,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .when([], {
            is: () => question.isRequired,
            then: schema => schema.required().min(1),
            otherwise: schema => schema.nullable(),
          })
          .max(question.options.length)
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .oneOf(question.options.map(opt => opt.id))
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .when("optionId", {
                  is: (optionId: number) => question.options.find(opt => opt.id === optionId)?.requiresInput,
                  then: schema => schema.required(),
                  otherwise: schema => schema.nullable(),
                })
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
    case QuestionTypeEnum.RADIO:
      return yup.object({
        content: yup
          .string()
          .nullable()
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .when([], {
            is: () => question.requiresExplanation,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .when([], {
            is: () => question.isRequired,
            then: schema => schema.required().length(1),
            otherwise: schema => schema.nullable(),
          })
          .max(1)
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .oneOf(question.options.map(opt => opt.id))
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .when("optionId", {
                  is: (optionId: number) => question.options.find(opt => opt.id === optionId)?.requiresInput,
                  then: schema => schema.required(),
                  otherwise: schema => schema.nullable(),
                })
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
    case QuestionTypeEnum.BOOLEAN:
      return yup.object({
        content: yup
          .boolean()
          .when([], {
            is: () => question.isRequired,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .default(null)
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .when([], {
            is: () => question.requiresExplanation,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .nullable()
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .nullable()
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
    case QuestionTypeEnum.SCALE:
      return yup.object({
        content: yup
          .number()
          .when([], {
            is: () => question.isRequired,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .oneOf(Object.keys(question.scale?.options ?? {}).map(k => Number(k)))
          .default(null)
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .when([], {
            is: () => question.requiresExplanation,
            then: schema => schema.required(),
            otherwise: schema => schema.nullable(),
          })
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .nullable()
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .nullable()
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
    default:
      return yup.object({
        content: yup
          .string()
          .nullable()
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        explanation: yup
          .string()
          .nullable()
          .max(500)
          .default(null)
          .trim()
          .transform(value => (value !== "" ? value : null)),
        choices: yup
          .array()
          .nullable()
          .of(
            yup.object({
              optionId: yup
                .number()
                .required()
                .default(null)
                .transform(value => value ?? null),
              content: yup
                .string()
                .nullable()
                .max(500)
                .default(null)
                .trim()
                .transform(value => (value !== "" ? value : null)),
            })
          )
          .default(null),
      });
  }
};

const generateFollowUpValidationSchema = (): yup.ObjectSchema<ClassicSurveyMessageRequestDTO> => {
  return yup.object({
    content: yup
      .string()
      .required()
      .max(500)
      .default(null)
      .transform(value => (value !== "" ? value : null)),
  });
};

const generateDiscussionValidationSchema = (): yup.ObjectSchema<ClassicSurveyMessageRequestDTO> => {
  return yup.object({
    content: yup
      .string()
      .required()
      .max(500)
      .default(null)
      .transform(value => (value !== "" ? value : null)),
  });
};

const generateFinalNoteValidationSchema = (): yup.ObjectSchema<FinalNoteRequestDTO> => {
  return yup.object({
    content: yup
      .string()
      .nullable()
      .max(500)
      .default(null)
      .transform(value => (value !== "" ? value : null)),
  });
};

export const validation = {
  generateQuestionValidationSchema,
  generateFollowUpValidationSchema,
  generateDiscussionValidationSchema,
  generateChooseYourAvatarValidationSchema,
  generateFinalNoteValidationSchema,
};
