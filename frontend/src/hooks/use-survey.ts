import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { surveyReducer } from "@/store/survey";
import { SurveyAction, SurveyActionType, SurveyState } from "@/types/store";
import { ActiveSurveyPage, SectionTypeEnum, SurveyType } from "@/types/survey";
import { ChatRole, ChatType, ChatModelType } from "@/types/chat";
import {
  AnswerRequestDTO,
  AvatarSurveyMessageRequestDTO,
  ChooseYourAvatarRequestDTO,
  ClassicSurveyMessageRequestDTO,
  FinalNoteRequestDTO,
} from "@/types/dtos";
import { surveyTokenStorage } from "@/utils/survey.token";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { validation } from "@/components/forms/validation";
import { useQuery } from "@tanstack/react-query";
import { useResultService } from "@/api/services/result.service";
import { useFollowUpService } from "@/api/services/follow-up.service";
import { useAnswerService } from "@/api/services/answer.service";
import { useSubmissionService } from "@/api/services/submission.service";
import { useSurveyAuth } from "./use-survey-auth";
import { useNavigate } from "react-router-dom";
import { useSectionService } from "@/api/services/section.service";
import { useAvatarService } from "@/api/services/avatar.service";
import { SECTION_KEYS } from "@/lib/config";
import { useDiscussionService } from "@/api/services/discussion.service";
import { ERROR_CODES } from "@/lib/error";
import { useChatSessionService } from "@/api/services/chatsession.service";

const initialSurveyState: SurveyState = {
  initialized: false,
  submission: null,
  navigation: {
    section: null,
    question: null,
    active: ActiveSurveyPage.NONE,
  },
};

export const useSurvey = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(surveyReducer, initialSurveyState);
  const currentNavigation = useRef(state.navigation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousQuestionId = useRef(state.navigation.question?.data.id);
  const previousSectionId = useRef(state.navigation.section?.data.id);
  const { surveyId, token } = useSurveyAuth();
  const { getSubmission, completeSurvey, exitSurvey, privacyConsentGiven } = useSubmissionService(token);
  const { submitAnswer } = useAnswerService(token);
  const {
    sendMessage: sendFollowUpMessage,
    closeChat: closeFollowUpChat,
    sendFinalNote: sendFollowUpFinalNote,
  } = useFollowUpService(token);
  const { completeSection } = useResultService(token);
  const { getSection } = useSectionService(token);
  const { setAvatar } = useAvatarService(token);
  const {
    sendMessage: sendDiscussionMessage,
    closeChat: closeDiscussionChat,
    sendFinalNote: sendDiscussionFinalNote,
  } = useDiscussionService(token);
  const { startedAnsweringMessage, messageAsked } = useChatSessionService(token);
  const {
    data: initialSubmission,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["submission", token],
    queryFn: () => getSubmission(surveyId),
    enabled: !!surveyId && !!token,
  });
  const { data: initialSection } = useQuery({
    queryKey: ["section", surveyId, state.navigation.section?.data.id],
    queryFn: () => getSection(surveyId, state.navigation.section!.data.id),
    enabled: state.navigation.section?.data.type === SectionTypeEnum.RESULTS,
  });
  const questionFormValidationSchema = useMemo(
    () => validation.generateQuestionValidationSchema(state.navigation.question?.data),
    [state.navigation.question?.data]
  );
  const followUpFormValidationSchema = validation.generateFollowUpValidationSchema();
  const discussionFormValidationSchema = validation.generateDiscussionValidationSchema();
  const chooseYourAvatarFormValidationSchema = validation.generateChooseYourAvatarValidationSchema();
  const questionForm = useForm<AnswerRequestDTO>({
    resolver: yupResolver(questionFormValidationSchema),
    defaultValues: state.navigation.question?.data.answer ?? { content: null, explanation: null, choices: null },
    disabled: !!state.navigation.question?.data.answer,
  });
  const followUpForm = useForm<ClassicSurveyMessageRequestDTO>({
    resolver: yupResolver(followUpFormValidationSchema),
    defaultValues: { content: "" },
    disabled: !!state.navigation.question?.data.chats.followUp?.isClosed,
  });
  const discussionForm = useForm<ClassicSurveyMessageRequestDTO>({
    resolver: yupResolver(discussionFormValidationSchema),
    defaultValues: { content: "" },
    disabled: !!state.navigation.section?.data.chats.discussion?.isClosed,
  });
  const chooseYourAvatarForm = useForm<ChooseYourAvatarRequestDTO>({
    resolver: yupResolver(chooseYourAvatarFormValidationSchema),
    defaultValues: { avatarId: state.submission?.avatarId ?? "" },
  });
  const finalNoteForm = useForm<FinalNoteRequestDTO>({
    resolver: yupResolver(validation.generateFinalNoteValidationSchema()),
    defaultValues: { content: "" },
  });

  const onStartedAnsweringMessage = useCallback(async () => {
    if (!state.initialized) return;
    let activeChat = null;
    if (currentNavigation.current.active === ActiveSurveyPage.QUESTION) {
      activeChat = currentNavigation.current.question.data.chats.followUp;
    } else if (currentNavigation.current.active === ActiveSurveyPage.SECTION) {
      activeChat = currentNavigation.current.section.data.chats.discussion;
    }
    if (activeChat) {
      const assistantMessages = activeChat.messages.filter(message => message.role === ChatRole.ASSISTANT);
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
      if (lastAssistantMessage)
        await startedAnsweringMessage(state.submission.surveyId, activeChat.id, lastAssistantMessage.id);
    }
  }, [startedAnsweringMessage, state.initialized, state.submission?.surveyId]);

  const onMessageAsked = useCallback(async () => {
    if (!state.initialized) return;
    let activeChat = null;
    if (currentNavigation.current.active === ActiveSurveyPage.QUESTION) {
      activeChat = currentNavigation.current.question.data.chats.followUp;
    } else if (currentNavigation.current.active === ActiveSurveyPage.SECTION) {
      activeChat = currentNavigation.current.section.data.chats.discussion;
    }
    if (activeChat) {
      const assistantMessages = activeChat.messages.filter(message => message.role === ChatRole.ASSISTANT);
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
      if (lastAssistantMessage) await messageAsked(state.submission.surveyId, activeChat.id, lastAssistantMessage.id);
    }
  }, [messageAsked, state.initialized, state.submission?.surveyId]);

  const onPrivacyConsentGiven = useCallback(async () => {
    if (!state.initialized) return;
    const data = await privacyConsentGiven(state.submission.surveyId);
    dispatch({
      type: SurveyActionType.PRIVACY_CONSENT_GIVEN,
      payload: { privacyConsentGivenAt: data.privacyConsentGivenAt, expiresAt: data.expiresAt },
    });
  }, [privacyConsentGiven, state.initialized, state.submission?.surveyId]);

  const onExitSurvey = useCallback(async () => {
    if (!state.initialized) return;
    await exitSurvey(state.submission.surveyId);
    surveyTokenStorage.deleteToken(token);
    navigate("/");
  }, [exitSurvey, navigate, state.initialized, state.submission?.surveyId, token]);

  const onCompleteSurvey = useCallback(async () => {
    if (!state.initialized) return;
    await completeSurvey(state.submission.surveyId);
    surveyTokenStorage.deleteToken(token);
    window.location.href = "https://app.prolific.com/submissions/complete?cc=C1N7T6HG";
  }, [completeSurvey, state.initialized, state.submission?.surveyId, token]);

  const onCompleteSection = useCallback(async () => {
    if (!state.initialized || state.navigation.active === ActiveSurveyPage.NONE) return;
    if (!state.navigation.section.data.result) {
      const result = await completeSection(state.submission.surveyId, state.navigation.section.data.id);
      dispatch({ type: SurveyActionType.SET_RESULT, payload: { sectionId: state.navigation.section.data.id, result } });
    }
    const canCloseDiscussion =
      state.navigation.section.data.chats.discussion &&
      !state.navigation.section.data.chats.discussion.isClosed &&
      (!state.navigation.section.data.chats.discussion.isRequired ||
        (state.navigation.section.data.chats.discussion.requiredMessagesCount !== null &&
          state.navigation.section.data.chats.discussion.requiredMessagesCount <=
            state.navigation.section.data.chats.discussion.messages.filter(m => m.role === ChatRole.USER).length));

    if (canCloseDiscussion) {
      await closeDiscussionChat(state.submission.surveyId, state.navigation.section.data.id);
      dispatch({
        type: SurveyActionType.CLOSE_CHAT,
        payload: {
          modelType: ChatModelType.SECTION,
          modelId: state.navigation.section.data.id,
          chatType: ChatType.DISCUSSION,
        },
      });
      dispatch({
        type: SurveyActionType.FINAL_NOTE_SUBMITTED,
        payload: {
          modelType: ChatModelType.SECTION,
          modelId: state.navigation.section.data.id,
          chatType: ChatType.DISCUSSION,
        },
      });
    } else if (
      state.navigation.section.data.chats.discussion?.isRequired &&
      !state.navigation.section.data.chats.discussion.isClosed
    )
      return;

    if (state.navigation.section.index === state.submission.sections.length - 1) {
      await onCompleteSurvey();
    } else {
      dispatch({ type: SurveyActionType.NEXT_PAGE, payload: null });
    }
  }, [
    closeDiscussionChat,
    completeSection,
    onCompleteSurvey,
    state.initialized,
    state.navigation.active,
    state.navigation.section?.data.chats.discussion,
    state.navigation.section?.data.id,
    state.navigation.section?.data.result,
    state.navigation.section?.index,
    state.submission?.sections.length,
    state.submission?.surveyId,
  ]);

  const onSubmitAnswer = useCallback(
    async (answerData: AnswerRequestDTO) => {
      if (!state.initialized || state.navigation.active !== ActiveSurveyPage.QUESTION) return;
      let followUpClosed = state.navigation.question.data.chats.followUp?.isClosed ?? true;
      if (!state.navigation.question.data.answer) {
        const answer = await submitAnswer(
          state.submission.surveyId,
          state.navigation.section.data.id,
          state.navigation.question.data.id,
          answerData
        );
        dispatch({
          type: SurveyActionType.SET_ANSWER,
          payload: {
            sectionId: state.navigation.section.data.id,
            questionId: state.navigation.question.data.id,
            answer,
          },
        });
      } else if (
        state.navigation.question.data.chats.followUp &&
        !state.navigation.question.data.chats.followUp?.isClosed
      ) {
        await closeFollowUpChat(
          state.submission.surveyId,
          state.navigation.section.data.id,
          state.navigation.question.data.id
        );
        dispatch({
          type: SurveyActionType.CLOSE_CHAT,
          payload: {
            modelType: ChatModelType.QUESTION,
            modelId: state.navigation.question.data.id,
            chatType: ChatType.FOLLOW_UP,
          },
        });
        dispatch({
          type: SurveyActionType.FINAL_NOTE_SUBMITTED,
          payload: {
            modelType: ChatModelType.QUESTION,
            modelId: state.navigation.question.data.id,
            chatType: ChatType.FOLLOW_UP,
          },
        });
        followUpClosed = true;
      }

      if (state.navigation.question.index === state.navigation.section.data.questions.length - 1 && followUpClosed) {
        await onCompleteSection();
      } else if (followUpClosed) {
        dispatch({ type: SurveyActionType.NEXT_PAGE, payload: null });
      }
    },
    [
      closeFollowUpChat,
      onCompleteSection,
      state.initialized,
      state.navigation.active,
      state.navigation.question?.data.answer,
      state.navigation.question?.data.chats.followUp,
      state.navigation.question?.data.id,
      state.navigation.question?.index,
      state.navigation.section?.data.id,
      state.navigation.section?.data.questions.length,
      state.submission?.surveyId,
      submitAnswer,
    ]
  );

  const onCompleteChooseYourAvatarSection = useCallback(
    async (avatarData: ChooseYourAvatarRequestDTO) => {
      if (!state.initialized || state.navigation.active !== ActiveSurveyPage.SECTION) return;
      await setAvatar(state.submission.surveyId, avatarData.avatarId);
      dispatch({ type: SurveyActionType.SET_AVATAR, payload: { avatarId: avatarData.avatarId } });
      await onCompleteSection();
    },
    [onCompleteSection, setAvatar, state.initialized, state.navigation.active, state.submission?.surveyId]
  );

  const onMessageTyped = useCallback((payload: SurveyAction<SurveyActionType.MESSAGE_TYPED>["payload"]) => {
    dispatch({ type: SurveyActionType.MESSAGE_TYPED, payload });
  }, []);

  const onSubmitFollowUpMessage = useCallback(
    async (messageData: ClassicSurveyMessageRequestDTO | AvatarSurveyMessageRequestDTO) => {
      if (!state.initialized || currentNavigation.current.active !== ActiveSurveyPage.QUESTION) return;
      if (
        currentNavigation.current.question.data.chats.followUp &&
        !currentNavigation.current.question.data.chats.followUp.isClosed
      ) {
        if (state.submission.type === SurveyType.AVATAR) {
          const response = await sendFollowUpMessage(
            state.submission.surveyId,
            currentNavigation.current.section.data.id,
            currentNavigation.current.question.data.id,
            messageData
          )
            .then(res => res)
            .catch(e => {
              if (e.code === ERROR_CODES.SURVEY_VIOLATION) {
                dispatch({ type: SurveyActionType.REMOVE_LAST_USER_MESSAGE_FROM_CURRENT_CHAT, payload: null });
              }
            });
          if (response) {
            dispatch({
              type: SurveyActionType.ADD_MESSAGES,
              payload: {
                modelType: ChatModelType.QUESTION,
                modelId: currentNavigation.current.question.data.id,
                chatType: ChatType.FOLLOW_UP,
                messages: response.messages,
                isClosed: response
                  ? response.isClosed
                  : currentNavigation.current.question.data.chats.followUp.isClosed,
                isThinking: false,
                messageToRemove: null,
              },
            });
          }
        } else {
          const tempMessageId = `question-${currentNavigation.current.question.data.id}-temp-follow-up-message`;
          followUpForm.reset({ content: "" });
          dispatch({
            type: SurveyActionType.ADD_MESSAGE,
            payload: {
              modelType: ChatModelType.QUESTION,
              modelId: currentNavigation.current.question.data.id,
              chatType: ChatType.FOLLOW_UP,
              isClosed: currentNavigation.current.question.data.chats.followUp.isClosed,
              isThinking: true,
              message: {
                id: tempMessageId,
                role: ChatRole.USER,
                content: messageData.content,
              },
              messageToRemove: null,
            },
          });
          const response = await sendFollowUpMessage(
            state.submission.surveyId,
            currentNavigation.current.section.data.id,
            currentNavigation.current.question.data.id,
            messageData
          )
            .then(res => res)
            .catch(() => null);
          if (response) {
            dispatch({
              type: SurveyActionType.ADD_MESSAGES,
              payload: {
                modelType: ChatModelType.QUESTION,
                modelId: currentNavigation.current.question.data.id,
                chatType: ChatType.FOLLOW_UP,
                messages: [response.messages[0], { ...response.messages[1], shouldTypewrite: true }],
                isClosed: response
                  ? response.isClosed
                  : currentNavigation.current.question.data.chats.followUp.isClosed,
                isThinking: false,
                messageToRemove: tempMessageId,
              },
            });
          } else {
            dispatch({
              type: SurveyActionType.REMOVE_MESSAGE,
              payload: {
                modelType: ChatModelType.QUESTION,
                modelId: currentNavigation.current.question.data.id,
                chatType: ChatType.FOLLOW_UP,
                isClosed: currentNavigation.current.question.data.chats.followUp.isClosed,
                isThinking: false,
                messageToRemove: tempMessageId,
              },
            });
          }
        }
      }
    },
    [followUpForm, sendFollowUpMessage, state.initialized, state.submission?.surveyId, state.submission?.type]
  );

  const onSubmitDiscussionMessage = useCallback(
    async (messageData: ClassicSurveyMessageRequestDTO | AvatarSurveyMessageRequestDTO) => {
      if (!state.initialized || currentNavigation.current.active !== ActiveSurveyPage.SECTION) return;
      if (
        currentNavigation.current.section.data.chats.discussion &&
        !currentNavigation.current.section.data.chats.discussion.isClosed
      ) {
        if (state.submission.type === SurveyType.AVATAR) {
          const response = await sendDiscussionMessage(
            state.submission.surveyId,
            currentNavigation.current.section.data.id,
            messageData
          )
            .then(res => res)
            .catch(e => {
              if (e.code === ERROR_CODES.SURVEY_VIOLATION) {
                dispatch({ type: SurveyActionType.REMOVE_LAST_USER_MESSAGE_FROM_CURRENT_CHAT, payload: null });
              }
            });
          if (response) {
            dispatch({
              type: SurveyActionType.ADD_MESSAGES,
              payload: {
                modelType: ChatModelType.SECTION,
                modelId: currentNavigation.current.section.data.id,
                chatType: ChatType.DISCUSSION,
                messages: response.messages,
                isClosed: response
                  ? response.isClosed
                  : currentNavigation.current.section.data.chats.discussion.isClosed,
                isThinking: false,
                messageToRemove: null,
              },
            });
          }
        } else {
          const tempMessageId = `section-${currentNavigation.current.section.data.id}-temp-discussion-message`;
          discussionForm.reset({ content: "" });
          dispatch({
            type: SurveyActionType.ADD_MESSAGE,
            payload: {
              modelType: ChatModelType.SECTION,
              modelId: currentNavigation.current.section.data.id,
              chatType: ChatType.DISCUSSION,
              isClosed: currentNavigation.current.section.data.chats.discussion.isClosed,
              isThinking: true,
              message: {
                id: tempMessageId,
                role: ChatRole.USER,
                content: messageData.content,
              },
              messageToRemove: null,
            },
          });
          const response = await sendDiscussionMessage(
            state.submission.surveyId,
            currentNavigation.current.section.data.id,
            messageData
          )
            .then(res => res)
            .catch(() => null);
          if (response) {
            dispatch({
              type: SurveyActionType.ADD_MESSAGES,
              payload: {
                modelType: ChatModelType.SECTION,
                modelId: currentNavigation.current.section.data.id,
                chatType: ChatType.DISCUSSION,
                messages: [response.messages[0], { ...response.messages[1], shouldTypewrite: true }],
                isClosed: response
                  ? response.isClosed
                  : currentNavigation.current.section.data.chats.discussion.isClosed,
                isThinking: false,
                messageToRemove: tempMessageId,
              },
            });
          } else {
            dispatch({
              type: SurveyActionType.REMOVE_MESSAGE,
              payload: {
                modelType: ChatModelType.SECTION,
                modelId: currentNavigation.current.section.data.id,
                chatType: ChatType.DISCUSSION,
                isClosed: currentNavigation.current.section.data.chats.discussion.isClosed,
                isThinking: false,
                messageToRemove: tempMessageId,
              },
            });
          }
        }
      }
    },
    [discussionForm, sendDiscussionMessage, state.initialized, state.submission?.surveyId, state.submission?.type]
  );

  const onContinue = useCallback(async () => {
    setIsSubmitting(true);
    try {
      switch (state.navigation.active) {
        case ActiveSurveyPage.QUESTION:
          await questionForm.handleSubmit(onSubmitAnswer)();
          break;
        case ActiveSurveyPage.SECTION:
          if (SECTION_KEYS.CHOOSE_YOUR_AVATARS.includes(state.navigation.section.data.key))
            await chooseYourAvatarForm.handleSubmit(onCompleteChooseYourAvatarSection)();
          else await onCompleteSection();
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    state.navigation.active,
    state.navigation.section?.data.key,
    questionForm,
    onSubmitAnswer,
    chooseYourAvatarForm,
    onCompleteChooseYourAvatarSection,
    onCompleteSection,
  ]);

  const onSubmitFinalNote = useCallback(
    async (finalNoteData: FinalNoteRequestDTO) => {
      if (!state.initialized) return;
      if (currentNavigation.current.active === ActiveSurveyPage.QUESTION) {
        await sendFollowUpFinalNote(
          state.submission.surveyId,
          currentNavigation.current.section.data.id,
          currentNavigation.current.question.data.id,
          finalNoteData
        );
        dispatch({
          type: SurveyActionType.FINAL_NOTE_SUBMITTED,
          payload: {
            modelType: ChatModelType.QUESTION,
            modelId: currentNavigation.current.question.data.id,
            chatType: ChatType.FOLLOW_UP,
          },
        });
      } else if (currentNavigation.current.active === ActiveSurveyPage.SECTION) {
        await sendDiscussionFinalNote(
          state.submission.surveyId,
          currentNavigation.current.section.data.id,
          finalNoteData
        );
        dispatch({
          type: SurveyActionType.FINAL_NOTE_SUBMITTED,
          payload: {
            modelType: ChatModelType.SECTION,
            modelId: currentNavigation.current.section.data.id,
            chatType: ChatType.DISCUSSION,
          },
        });
      }
      await onContinue();
    },
    [sendDiscussionFinalNote, sendFollowUpFinalNote, onContinue, state.initialized, state.submission?.surveyId]
  );

  useEffect(() => {
    if (state.submission?.avatarId) chooseYourAvatarForm.reset({ avatarId: state.submission.avatarId });
  }, [chooseYourAvatarForm, state.submission?.avatarId]);

  useEffect(() => {
    if (state.navigation.question) {
      questionForm.reset(state.navigation.question.data.answer ?? { content: null, explanation: null, choices: null });
    }
  }, [questionForm, state.navigation.question]);

  useEffect(() => {
    const currentQuestionId = state.navigation.question?.data.id;
    if (currentQuestionId && currentQuestionId !== previousQuestionId.current) {
      followUpForm.reset({ content: "" });
      finalNoteForm.reset({ content: "" });
      previousQuestionId.current = currentQuestionId;
    }
  }, [followUpForm, finalNoteForm, state.navigation.question?.data.id]);

  useEffect(() => {
    const currentSectionId = state.navigation.section?.data.id;
    if (currentSectionId && currentSectionId !== previousSectionId.current) {
      discussionForm.reset({ content: "" });
      finalNoteForm.reset({ content: "" });
      previousSectionId.current = currentSectionId;
    }
  }, [discussionForm, finalNoteForm, state.navigation.section?.data.id]);

  useEffect(() => {
    if (initialSubmission) {
      dispatch({
        type: SurveyActionType.INITIALIZE,
        payload: {
          submission: initialSubmission,
        },
      });
    }
  }, [initialSubmission]);

  useEffect(() => {
    if (initialSection) {
      dispatch({
        type: SurveyActionType.SET_SECTION,
        payload: { section: initialSection },
      });
    }
  }, [initialSection]);

  useEffect(() => {
    const checkActiveSurveyPage = async () => {
      if (state.navigation.active === ActiveSurveyPage.NONE) {
        await onCompleteSurvey();
      }
    };
    checkActiveSurveyPage();
  }, [onCompleteSurvey, state.navigation.active]);

  useEffect(() => {
    currentNavigation.current = state.navigation;
  }, [state.navigation]);

  return {
    state: {
      ...state,
      isLoading: isLoading && !state.initialized && !isError,
      isError,
      isSubmitting,
    },
    forms: {
      question: questionForm,
      followUp: followUpForm,
      discussion: discussionForm,
      chooseYourAvatar: chooseYourAvatarForm,
      finalNote: finalNoteForm,
    },
    methods: {
      continue: onContinue,
      previousPage: () => dispatch({ type: SurveyActionType.PREVIOUS_PAGE, payload: null }),
      exitSurvey: onExitSurvey,
      sendFollowUpMessage: onSubmitFollowUpMessage,
      sendDiscussionMessage: onSubmitDiscussionMessage,
      sendFinalNote: onSubmitFinalNote,
      messageTyped: onMessageTyped,
      onStartedAnsweringMessage,
      onMessageAsked,
      privacyConsentGiven: onPrivacyConsentGiven,
    },
  };
};
