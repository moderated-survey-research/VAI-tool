import SurveyLayout from "@/layouts/SurveyLayout";
import { useSurvey } from "@/hooks/use-survey";
import { ActiveSurveyPage, SurveyType } from "@/types/survey";
import SurveyHeader from "@/layouts/SurveyHeader";
import QuestionPage from "./survey/QuestionPage";
import SectionPage from "./survey/SectionPage";
import SurveyFooter from "@/layouts/SurveyFooter";
import { ChatModelType, ChatType } from "@/types/chat";
import { useMicrophone } from "@/hooks/use-microphone";
import { useEffect, useMemo, useState } from "react";
import Loading from "@/components/structure/Loading";
import HeygenAvatar from "@/components/avatar/HeygenAvatar";
import { Transition } from "@headlessui/react";
import { SURVEY_TRANSITIONS } from "@/lib/transition";
import SurveyProgressBar from "@/components/structure/SurveyProgressBar";
import { SECTION_KEYS } from "@/lib/config";
import Chat from "@/components/chats/Chat";
import { FormProvider } from "react-hook-form";
import FinalNoteModal from "@/components/modals/FinalNoteModal";
import PrivacyConsentPage from "./survey/PrivacyConsentPage";

const SurveyPage: React.FC = () => {
  const { microphoneAccess, getMicrophoneAccess } = useMicrophone({ isRequired: false });
  const {
    state: { submission, navigation, isLoading, isError, isSubmitting },
    forms,
    methods,
  } = useSurvey();
  const isLoadingInternal =
    isLoading ||
    !submission ||
    navigation.active === ActiveSurveyPage.NONE ||
    (navigation.section.data.isAiAssisted && !microphoneAccess);
  const [canOpenFinalNoteModal, setCanOpenFinalNoteModal] = useState(false);
  const finalNoteModalOpened = useMemo(() => {
    if (submission?.type !== SurveyType.AVATAR || !canOpenFinalNoteModal) return false;

    if (
      navigation.active === ActiveSurveyPage.QUESTION &&
      navigation.question.data.chats.followUp?.isClosed &&
      !navigation.question.data.chats.followUp?.finalNoteSubmittedAt
    ) {
      return true;
    } else if (
      navigation.active === ActiveSurveyPage.SECTION &&
      navigation.section.data.chats.discussion?.isClosed &&
      !navigation.section.data.chats.discussion?.finalNoteSubmittedAt
    ) {
      return true;
    }

    return false;
  }, [
    navigation.active,
    navigation.question?.data.chats.followUp?.finalNoteSubmittedAt,
    navigation.question?.data.chats.followUp?.isClosed,
    navigation.section?.data.chats.discussion?.finalNoteSubmittedAt,
    navigation.section?.data.chats.discussion?.isClosed,
    submission?.type,
    canOpenFinalNoteModal,
  ]);

  useEffect(() => {
    if (
      submission?.type === SurveyType.AVATAR &&
      navigation.section &&
      (navigation.section.data.isAiAssisted ||
        (SECTION_KEYS.MICROPHONE_CHECK.includes(navigation.section.data.key) && !microphoneAccess))
    ) {
      getMicrophoneAccess();
    }
  }, [getMicrophoneAccess, microphoneAccess, navigation.section, submission?.type]);

  if (isError) return null;

  return (
    <SurveyLayout>
      <Loading isLoading={isLoadingInternal}>
        {submission?.privacyConsentGivenAt ? (
          <>
            <SurveyProgressBar submission={submission} navigation={navigation} />
            <div className="flex flex-col w-full max-w-screen-md mx-auto">
              <SurveyHeader
                submission={submission}
                navigation={navigation}
                onPrevious={methods.previousPage}
                onExit={methods.exitSurvey}
              />
              <div className="flex flex-col items-center w-full mx-auto pt-6 pb-16 px-8 text-center">
                <Transition
                  key={`transition_section_${navigation.section?.data.id}`}
                  appear={true}
                  show={true}
                  as="div"
                  {...SURVEY_TRANSITIONS.ease_in_out_500}
                >
                  {navigation.active === ActiveSurveyPage.SECTION ? (
                    <>
                      <h1 className={`text-3xl font-medium ${navigation.section?.data.subtitle ? "mb-4" : "mb-6"}`}>
                        {navigation.section?.data.title}
                      </h1>
                      {navigation.section?.data.subtitle ? (
                        <h3 className="text-md mb-6 text-secondary">{navigation.section.data.subtitle}</h3>
                      ) : null}
                    </>
                  ) : null}
                </Transition>
                {!isLoadingInternal ? (
                  <FormProvider {...forms.finalNote}>
                    <FinalNoteModal
                      isOpen={finalNoteModalOpened}
                      onSubmit={methods.sendFinalNote}
                      isSubmitting={isSubmitting}
                    />
                    {navigation.active === ActiveSurveyPage.QUESTION ? (
                      <QuestionPage
                        form={forms.question}
                        question={navigation.question.data}
                        avatarId={submission.avatarId}
                        isAiAssisted={navigation.section.data.isAiAssisted}
                        onSubmit={methods.continue}
                      />
                    ) : null}
                    {navigation.active === ActiveSurveyPage.SECTION ? (
                      <SectionPage
                        questionnaireType={submission.questionnaireType}
                        form={forms.chooseYourAvatar}
                        section={navigation.section.data}
                        avatarId={submission.avatarId}
                        onSubmit={methods.continue}
                        surveyKey={submission.key}
                      />
                    ) : null}
                  </FormProvider>
                ) : null}
              </div>
              <SurveyFooter
                forms={forms}
                navigation={navigation}
                submission={submission}
                onContinue={methods.continue}
                isSubmitting={isSubmitting}
                microphoneAccess={microphoneAccess}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full max-w-screen-sm m-auto">
            <PrivacyConsentPage onSubmit={methods.privacyConsentGiven} surveyType={submission?.type}/>
          </div>
        )}
      </Loading>

      {submission?.privacyConsentGivenAt ? (
        <>
          {submission?.type === SurveyType.CLASSIC ? (
            <>
              {navigation.active === ActiveSurveyPage.QUESTION &&
              navigation.question.data.answer &&
              navigation.question.data.chats.followUp ? (
                <Chat
                  chat={navigation.question.data.chats.followUp}
                  onSubmit={methods.sendFollowUpMessage}
                  form={forms.followUp}
                  onMessageTyped={(messageId: string | number) => {
                    methods.messageTyped({
                      modelId: navigation.question.data.id,
                      modelType: ChatModelType.QUESTION,
                      chatType: ChatType.FOLLOW_UP,
                      messageId,
                    });
                  }}
                  onStartedAnsweringMessage={methods.onStartedAnsweringMessage}
                  onMessageAsked={methods.onMessageAsked}
                  canOpenFinalNoteModal={canOpenFinalNoteModal}
                  setCanOpenFinalNoteModal={setCanOpenFinalNoteModal}
                />
              ) : null}
              {navigation.active === ActiveSurveyPage.SECTION &&
              navigation.section.data.chats.discussion &&
              (!navigation.section.data.chats.discussion.isRequired || navigation.section.data.result) ? (
                <Chat
                  chat={navigation.section.data.chats.discussion}
                  onSubmit={methods.sendDiscussionMessage}
                  form={forms.discussion}
                  onMessageTyped={(messageId: string | number) => {
                    methods.messageTyped({
                      modelId: navigation.section.data.id,
                      modelType: ChatModelType.SECTION,
                      chatType: ChatType.DISCUSSION,
                      messageId,
                    });
                  }}
                  onStartedAnsweringMessage={methods.onStartedAnsweringMessage}
                  onMessageAsked={methods.onMessageAsked}
                  canOpenFinalNoteModal={canOpenFinalNoteModal}
                  setCanOpenFinalNoteModal={setCanOpenFinalNoteModal}
                />
              ) : null}
            </>
          ) : null}
          {submission?.type === SurveyType.AVATAR && submission?.avatarId && navigation.section?.data.isAiAssisted ? (
            <>
              {navigation.active === ActiveSurveyPage.QUESTION ? (
                <HeygenAvatar
                  avatarId={submission.avatarId}
                  onSubmitMessage={methods.sendFollowUpMessage}
                  navigation={navigation}
                  onStartedAnsweringMessage={methods.onStartedAnsweringMessage}
                  onMessageAsked={methods.onMessageAsked}
                  canOpenFinalNoteModal={canOpenFinalNoteModal}
                  setCanOpenFinalNoteModal={setCanOpenFinalNoteModal}
                />
              ) : null}
              {navigation.active === ActiveSurveyPage.SECTION ? (
                <HeygenAvatar
                  avatarId={submission.avatarId}
                  onSubmitMessage={methods.sendDiscussionMessage}
                  navigation={navigation}
                  onStartedAnsweringMessage={methods.onStartedAnsweringMessage}
                  onMessageAsked={methods.onMessageAsked}
                  canOpenFinalNoteModal={canOpenFinalNoteModal}
                  setCanOpenFinalNoteModal={setCanOpenFinalNoteModal}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </SurveyLayout>
  );
};

export default SurveyPage;
