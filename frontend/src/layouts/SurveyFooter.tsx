import { AnswerRequestDTO, ChooseYourAvatarRequestDTO, SubmissionResponseDTO } from "@/types/dtos";
import { Button, Spinner, Tooltip } from "@nextui-org/react";
import { UseFormReturn } from "react-hook-form";
import { SECTION_KEYS } from "@/lib/config";
import { ActiveSurveyPage, SurveyType } from "@/types/survey";
import { SurveyState } from "@/types/store";
import { useMemo } from "react";
import { ChatRole } from "@/types/chat";

interface Props {
  forms: {
    question: UseFormReturn<AnswerRequestDTO>;
    chooseYourAvatar: UseFormReturn<ChooseYourAvatarRequestDTO>;
  };
  onContinue: () => void;
  navigation: SurveyState["navigation"];
  submission: SubmissionResponseDTO | null;
  isSubmitting: boolean;
  microphoneAccess: boolean;
}

const SurveyFooter: React.FC<Props> = ({
  onContinue,
  forms,
  navigation,
  submission,
  isSubmitting,
  microphoneAccess,
}) => {
  const hasNext = useMemo(
    () =>
      !!submission &&
      ((navigation.section && navigation.section.index !== submission.sections.length - 1) ||
        (navigation.question && navigation.question.index !== navigation.section.data.questions.length - 1)),
    [navigation, submission]
  );

  const isDisabled = useMemo(() => {
    const discussionThreshold = parseInt(import.meta.env.VITE_SURVEY_DISCUSSION_THRESHOLD || 10, 10);
    const followUpThreshold = parseInt(import.meta.env.VITE_SURVEY_FOLLOW_UP_THRESHOLD || 3, 10);
    switch (navigation.active) {
      case ActiveSurveyPage.QUESTION: {
        const assistantMessagesCount =
          navigation.question.data.chats.followUp?.messages.filter(m => m.role === ChatRole.ASSISTANT).length ?? 0;
        return (
          (!navigation.question.data.answer && !forms.question.formState.isValid) ||
          (navigation.question.data.answer &&
            navigation.question.data.chats.followUp?.isRequired &&
            ((navigation.question.data.chats.followUp.requiredMessagesCount !== null &&
              navigation.question.data.chats.followUp.requiredMessagesCount >
                navigation.question.data.chats.followUp.messages.filter(
                  m => m.role === ChatRole.USER && typeof m.id === "number"
                ).length) ||
              (navigation.question.data.chats.followUp.requiredMessagesCount === null &&
                !navigation.question.data.chats.followUp.isClosed))) ||
          (submission?.type === SurveyType.AVATAR &&
            navigation.question.data.chats.followUp?.isClosed &&
            assistantMessagesCount >= followUpThreshold &&
            !navigation.question.data.chats.followUp.finalNoteSubmittedAt)
        );
      }
      case ActiveSurveyPage.SECTION: {
        const assistantMessagesCount =
          navigation.section.data.chats.discussion?.messages.filter(m => m.role === ChatRole.ASSISTANT).length ?? 0;
        return (
          (SECTION_KEYS.CHOOSE_YOUR_AVATARS.includes(navigation.section.data.key) &&
            !submission?.avatarId &&
            !forms.chooseYourAvatar.formState.isValid) ||
          (navigation.section.data.result &&
            navigation.section.data.chats.discussion?.isRequired &&
            ((navigation.section.data.chats.discussion.requiredMessagesCount !== null &&
              navigation.section.data.chats.discussion.requiredMessagesCount >
                navigation.section.data.chats.discussion.messages.filter(
                  m => m.role === ChatRole.USER && typeof m.id === "number"
                ).length) ||
              (navigation.section.data.chats.discussion.requiredMessagesCount === null &&
                !navigation.section.data.chats.discussion.isClosed) ||
              (submission?.type === SurveyType.AVATAR &&
                navigation.section.data.chats.discussion.isClosed &&
                !navigation.section.data.chats.discussion.finalNoteSubmittedAt))) ||
          (submission?.type === SurveyType.AVATAR &&
            (navigation.section.data.isAiAssisted ||
              (SECTION_KEYS.MICROPHONE_CHECK.includes(navigation.section.data.key) && !microphoneAccess)) &&
            !microphoneAccess) ||
          (submission?.type === SurveyType.AVATAR &&
            navigation.section.data.chats.discussion?.isClosed &&
            assistantMessagesCount >= discussionThreshold &&
            !navigation.section.data.chats.discussion.finalNoteSubmittedAt)
        );
      }
      default:
        return true;
    }
  }, [
    forms.chooseYourAvatar.formState.isValid,
    forms.question.formState.isValid,
    microphoneAccess,
    navigation.active,
    navigation.question?.data.answer,
    navigation.question?.data.chats.followUp?.isClosed,
    navigation.question?.data.chats.followUp?.isRequired,
    navigation.question?.data.chats.followUp?.messages,
    navigation.question?.data.chats.followUp?.requiredMessagesCount,
    navigation.question?.data.chats.followUp?.finalNoteSubmittedAt,
    navigation.section?.data.chats.discussion?.isClosed,
    navigation.section?.data.chats.discussion?.isRequired,
    navigation.section?.data.chats.discussion?.messages,
    navigation.section?.data.chats.discussion?.requiredMessagesCount,
    navigation.section?.data.chats.discussion?.finalNoteSubmittedAt,
    navigation.section?.data.isAiAssisted,
    navigation.section?.data.key,
    navigation.section?.data.result,
    submission?.avatarId,
    submission?.type,
  ]);
  const showTooltip = useMemo(() => {
    switch (navigation.active) {
      case ActiveSurveyPage.QUESTION:
        return (
          navigation.question.data.answer &&
          navigation.question.data.chats.followUp?.isRequired &&
          ((navigation.question.data.chats.followUp.requiredMessagesCount !== null &&
            navigation.question.data.chats.followUp.requiredMessagesCount >
              navigation.question.data.chats.followUp.messages.filter(
                m => m.role === ChatRole.USER && typeof m.id === "number"
              ).length) ||
            (navigation.question.data.chats.followUp.requiredMessagesCount === null &&
              !navigation.question.data.chats.followUp.isClosed))
        );
      case ActiveSurveyPage.SECTION:
        return (
          navigation.section.data.result &&
          navigation.section.data.chats.discussion?.isRequired &&
          ((navigation.section.data.chats.discussion.requiredMessagesCount !== null &&
            navigation.section.data.chats.discussion.requiredMessagesCount >
              navigation.section.data.chats.discussion.messages.filter(
                m => m.role === ChatRole.USER && typeof m.id === "number"
              ).length) ||
            (navigation.section.data.chats.discussion.requiredMessagesCount === null &&
              !navigation.section.data.chats.discussion.isClosed))
        );
      default:
        return false;
    }
  }, [
    navigation.active,
    navigation.section?.data.result,
    navigation.question?.data.answer,
    navigation.question?.data.chats.followUp?.isClosed,
    navigation.question?.data.chats.followUp?.isRequired,
    navigation.question?.data.chats.followUp?.messages,
    navigation.question?.data.chats.followUp?.requiredMessagesCount,
    navigation.section?.data.chats.discussion?.isClosed,
    navigation.section?.data.chats.discussion?.isRequired,
    navigation.section?.data.chats.discussion?.messages,
    navigation.section?.data.chats.discussion?.requiredMessagesCount,
  ]);

  return (
    <footer className="flex justify-center pb-24">
      <Tooltip content="Please respond to the AI assistant before continuing." isDisabled={!showTooltip}>
        <div>
          <Button
            isDisabled={isDisabled || isSubmitting}
            onPress={onContinue}
            size="lg"
            color="primary"
            className="w-[200px] font-medium"
            endContent={isSubmitting ? <Spinner color="white" size="sm" /> : null}
          >
            {hasNext ? (
              <>
                {navigation.active === ActiveSurveyPage.SECTION &&
                !navigation.section.data.result &&
                navigation.section.data.chats.discussion?.isRequired
                  ? "I'm Ready to Chat"
                  : "Continue"}
              </>
            ) : (
              "Complete"
            )}
          </Button>
        </div>
      </Tooltip>
    </footer>
  );
};

export default SurveyFooter;
