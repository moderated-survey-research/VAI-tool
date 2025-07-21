import { ChatModelType, ChatRole, ChatType } from "@/types/chat";
import { SurveyAction, SurveyActionType, SurveyState } from "@/types/store";
import { ActiveSurveyPage, SectionTypeEnum } from "@/types/survey";
import { surveyUtil } from "@/utils/survey";

const onInitialize = (action: SurveyAction<SurveyActionType.INITIALIZE>): SurveyState => {
  const { section, question, active } = surveyUtil.getInitialNavigation(action.payload.submission);
  return {
    ...action.payload,
    initialized: true,
    navigation: {
      active: active,
      section: section,
      question: question,
    },
  } as SurveyState;
};

const onNextPage = (state: SurveyState): SurveyState => {
  if (!state.initialized) return state;
  if (state.navigation.active === ActiveSurveyPage.NONE) return state;
  if (
    state.navigation.active !== ActiveSurveyPage.SECTION &&
    state.navigation.question.index < (state.navigation.section.data.questions.length ?? 0) - 1
  ) {
    const nextQuestion = state.navigation.section.data.questions[state.navigation.question.index + 1];
    return {
      ...state,
      navigation: {
        ...state.navigation,
        question: {
          index: state.navigation.question.index + 1,
          data: nextQuestion,
        },
        active: ActiveSurveyPage.QUESTION,
      },
    };
  } else if (state.navigation.section.index < state.submission.sections.length - 1) {
    const nextSection = state.submission.sections[state.navigation.section.index + 1];
    if (nextSection.type !== SectionTypeEnum.QUESTIONNAIRE || nextSection.questions.length === 0) {
      return {
        ...state,
        navigation: {
          ...state.navigation,
          section: {
            index: state.navigation.section.index + 1,
            data: nextSection,
          },
          question: null,
          active: ActiveSurveyPage.SECTION,
        },
      };
    } else {
      const firstQuestion = nextSection.questions[0];
      return {
        ...state,
        navigation: {
          ...state.navigation,
          section: {
            index: state.navigation.section.index + 1,
            data: nextSection,
          },
          question: {
            index: 0,
            data: firstQuestion,
          },
          active: ActiveSurveyPage.QUESTION,
        },
      };
    }
  } else return state;
};

const onPreviousPage = (state: SurveyState): SurveyState => {
  if (!state.initialized) return state;
  if (state.navigation.active === ActiveSurveyPage.NONE) return state;
  if (state.navigation.active === ActiveSurveyPage.QUESTION && state.navigation.question.index > 0) {
    const previousQuestion = state.navigation.section.data.questions[state.navigation.question.index - 1];
    return {
      ...state,
      navigation: {
        ...state.navigation,
        question: {
          index: state.navigation.question.index - 1,
          data: previousQuestion,
        },
      },
    };
  } else if (state.navigation.section.index > 0) {
    const previousSection = state.submission.sections[state.navigation.section.index - 1];
    const lastQuestion =
      previousSection.type === SectionTypeEnum.QUESTIONNAIRE && previousSection.questions.length !== 0
        ? previousSection.questions[previousSection.questions.length - 1]
        : null;
    if (lastQuestion) {
      return {
        ...state,
        navigation: {
          ...state.navigation,
          section: {
            index: state.navigation.section.index - 1,
            data: previousSection,
          },
          question: {
            index: previousSection.questions.length - 1,
            data: lastQuestion,
          },
          active: ActiveSurveyPage.QUESTION,
        },
      };
    } else {
      return {
        ...state,
        navigation: {
          ...state.navigation,
          section: {
            index: state.navigation.section.index - 1,
            data: previousSection,
          },
          question: null,
          active: ActiveSurveyPage.SECTION,
        },
      };
    }
  } else return state;
};

const onSetAnswer = (state: SurveyState, action: SurveyAction<SurveyActionType.SET_ANSWER>): SurveyState => {
  if (!state.initialized) return state;
  const updatedSections = state.submission.sections.map(section =>
    section.id === action.payload.sectionId
      ? {
          ...section,
          questions: section.questions.map(question =>
            question.id === action.payload.questionId ? { ...question, answer: action.payload.answer } : question
          ),
        }
      : section
  );
  return {
    ...state,
    submission: {
      ...state.submission,
      sections: updatedSections,
    },
    navigation: {
      ...state.navigation,
      section:
        state.navigation.section?.data.id === action.payload.sectionId
          ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
          : state.navigation.section,
      question:
        state.navigation.section?.data.id === action.payload.sectionId &&
        state.navigation.question?.data.id === action.payload.questionId
          ? {
              ...state.navigation.question,
              data: updatedSections[state.navigation.section.index].questions[state.navigation.question.index],
            }
          : state.navigation.question,
    },
  } as SurveyState;
};

const onSetResult = (state: SurveyState, action: SurveyAction<SurveyActionType.SET_RESULT>): SurveyState => {
  if (!state.initialized) return state;
  const updatedSections = state.submission!.sections.map(section =>
    section.id === action.payload.sectionId ? { ...section, result: action.payload.result } : section
  );
  return {
    ...state,
    submission: {
      ...state.submission,
      sections: updatedSections,
    },
    navigation: {
      ...state.navigation,
      section:
        state.navigation.section?.data.id === action.payload.sectionId
          ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
          : state.navigation.section,
    },
  } as SurveyState;
};

const onSetSection = (state: SurveyState, action: SurveyAction<SurveyActionType.SET_SECTION>): SurveyState => {
  if (!state.initialized) return state;
  const updatedSections = state.submission.sections.map(section =>
    section.id === action.payload.section.id ? action.payload.section : section
  );
  return {
    ...state,
    submission: { ...state.submission, sections: updatedSections },
    navigation: {
      ...state.navigation,
      section:
        state.navigation.section?.data.id === action.payload.section.id
          ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
          : state.navigation.section,
    },
  } as SurveyState;
};

const onSetAvatar = (state: SurveyState, action: SurveyAction<SurveyActionType.SET_AVATAR>): SurveyState => {
  if (!state.initialized) return state;
  return {
    ...state,
    submission: { ...state.submission, avatarId: action.payload.avatarId },
  };
};

const onAddChatMessages = (state: SurveyState, action: SurveyAction<SurveyActionType.ADD_MESSAGES>): SurveyState => {
  if (!state.initialized) return state;
  switch (action.payload.modelType) {
    case ChatModelType.SECTION: {
      const updatedSections = state.submission.sections.map(section =>
        section.id === action.payload.modelId
          ? {
              ...section,
              chats: Object.entries(section.chats).reduce(
                (acc, [key, value]) =>
                  key === action.payload.chatType && value
                    ? {
                        ...acc,
                        [key]: {
                          ...value,
                          isClosed: action.payload.isClosed,
                          isThinking: action.payload.isThinking,
                          messages: [...value.messages, ...action.payload.messages],
                        },
                      }
                    : { ...acc, [key]: value },
                {}
              ),
            }
          : section
      );
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section:
            state.navigation.section?.data.id === action.payload.modelId
              ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
              : state.navigation.section,
        },
      } as SurveyState;
    }
    case ChatModelType.QUESTION: {
      const updatedSections = state.submission.sections.map(section => ({
        ...section,
        questions: section.questions.map(question =>
          question.id === action.payload.modelId
            ? {
                ...question,
                chats: Object.entries(question.chats).reduce(
                  (acc, [key, value]) =>
                    key === action.payload.chatType && value
                      ? {
                          ...acc,
                          [key]: {
                            ...value,
                            isClosed: action.payload.isClosed,
                            isThinking: action.payload.isThinking,
                            messages: [...value.messages, ...action.payload.messages],
                          },
                        }
                      : { ...acc, [key]: value },
                  {}
                ),
              }
            : question
        ),
      }));
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section: state.navigation.section
            ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
            : null,
          question:
            state.navigation.section && state.navigation.question?.data.id === action.payload.modelId
              ? {
                  ...state.navigation.question,
                  data: updatedSections[state.navigation.section.index].questions[state.navigation.question.index],
                }
              : state.navigation.question,
        },
      } as SurveyState;
    }
    default:
      return state;
  }
};

const onRemoveChatMessage = (
  state: SurveyState,
  action: SurveyAction<SurveyActionType.REMOVE_MESSAGE>
): SurveyState => {
  if (!state.initialized) return state;
  switch (action.payload.modelType) {
    case ChatModelType.SECTION: {
      const updatedSections = state.submission.sections.map(section =>
        section.id === action.payload.modelId
          ? {
              ...section,
              chats: Object.entries(section.chats).reduce(
                (acc, [key, value]) =>
                  key === action.payload.chatType && value
                    ? {
                        ...acc,
                        [key]: {
                          ...value,
                          isClosed: action.payload.isClosed,
                          isThinking: action.payload.isThinking,
                          messages: value.messages.filter(message => message.id !== action.payload.messageToRemove),
                        },
                      }
                    : { ...acc, [key]: value },
                {}
              ),
            }
          : section
      );
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section:
            state.navigation.section?.data.id === action.payload.modelId
              ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
              : state.navigation.section,
        },
      } as SurveyState;
    }
    case ChatModelType.QUESTION: {
      const updatedSections = state.submission.sections.map(section => ({
        ...section,
        questions: section.questions.map(question =>
          question.id === action.payload.modelId
            ? {
                ...question,
                chats: Object.entries(question.chats).reduce(
                  (acc, [key, value]) =>
                    key === action.payload.chatType && value
                      ? {
                          ...acc,
                          [key]: {
                            ...value,
                            isClosed: action.payload.isClosed,
                            isThinking: action.payload.isThinking,
                            messages: value.messages.filter(message => message.id !== action.payload.messageToRemove),
                          },
                        }
                      : { ...acc, [key]: value },
                  {}
                ),
              }
            : question
        ),
      }));
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section: state.navigation.section
            ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
            : null,
          question:
            state.navigation.section && state.navigation.question?.data.id === action.payload.modelId
              ? {
                  ...state.navigation.question,
                  data: updatedSections[state.navigation.section.index].questions[state.navigation.question.index],
                }
              : state.navigation.question,
        },
      } as SurveyState;
    }
    default:
      return state;
  }
};

const onMessageTyped = (state: SurveyState, action: SurveyAction<SurveyActionType.MESSAGE_TYPED>): SurveyState => {
  if (!state.initialized) return state;
  switch (action.payload.modelType) {
    case ChatModelType.SECTION: {
      const updatedSections = state.submission.sections.map(section =>
        section.id === action.payload.modelId
          ? {
              ...section,
              chats: Object.entries(section.chats).reduce(
                (acc, [key, value]) =>
                  key === action.payload.chatType && value
                    ? {
                        ...acc,
                        [key]: {
                          ...value,
                          messages: value.messages.map(message =>
                            message.id === action.payload.messageId
                              ? { ...message, shouldTypewrite: false, isTypewrited: true }
                              : message
                          ),
                        },
                      }
                    : { ...acc, [key]: value },
                {}
              ),
            }
          : section
      );
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section:
            state.navigation.section?.data.id === action.payload.modelId
              ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
              : state.navigation.section,
        },
      } as SurveyState;
    }
    case ChatModelType.QUESTION: {
      const updatedSections = state.submission.sections.map(section => ({
        ...section,
        questions: section.questions.map(question =>
          question.id === action.payload.modelId
            ? {
                ...question,
                chats: Object.entries(question.chats).reduce(
                  (acc, [key, value]) =>
                    key === action.payload.chatType && value
                      ? {
                          ...acc,
                          [key]: {
                            ...value,
                            messages: value.messages.map(message =>
                              message.id === action.payload.messageId
                                ? { ...message, shouldTypewrite: false, isTypewrited: true }
                                : message
                            ),
                          },
                        }
                      : { ...acc, [key]: value },
                  {}
                ),
              }
            : question
        ),
      }));
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section: state.navigation.section
            ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
            : null,
          question:
            state.navigation.section && state.navigation.question?.data.id === action.payload.modelId
              ? {
                  ...state.navigation.question,
                  data: updatedSections[state.navigation.section.index].questions[state.navigation.question.index],
                }
              : state.navigation.question,
        },
      } as SurveyState;
    }
    default:
      return state;
  }
};

const onCloseChat = (state: SurveyState, action: SurveyAction<SurveyActionType.CLOSE_CHAT>): SurveyState => {
  if (!state.initialized) return state;
  switch (action.payload.modelType) {
    case ChatModelType.SECTION: {
      const updatedSections = state.submission.sections.map(section =>
        section.id === action.payload.modelId
          ? {
              ...section,
              chats: Object.entries(section.chats).reduce(
                (acc, [key, value]) =>
                  key === action.payload.chatType && value
                    ? {
                        ...acc,
                        [key]: {
                          ...value,
                          isClosed: true,
                        },
                      }
                    : { ...acc, [key]: value },
                {}
              ),
            }
          : section
      );
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section:
            state.navigation.section?.data.id === action.payload.modelId
              ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
              : state.navigation.section,
        },
      } as SurveyState;
    }
    case ChatModelType.QUESTION: {
      const updatedSections = state.submission.sections.map(section => ({
        ...section,
        questions: section.questions.map(question =>
          question.id === action.payload.modelId
            ? {
                ...question,
                chats: Object.entries(question.chats).reduce(
                  (acc, [key, value]) =>
                    key === action.payload.chatType && value
                      ? {
                          ...acc,
                          [key]: {
                            ...value,
                            isClosed: true,
                          },
                        }
                      : { ...acc, [key]: value },
                  {}
                ),
              }
            : question
        ),
      }));
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section: state.navigation.section
            ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
            : null,
          question:
            state.navigation.section && state.navigation.question?.data.id === action.payload.modelId
              ? {
                  ...state.navigation.question,
                  data: updatedSections[state.navigation.section.index].questions[state.navigation.question.index],
                }
              : state.navigation.question,
        },
      } as SurveyState;
    }
    default:
      return state;
  }
};

const onFinalNoteSubmitted = (state: SurveyState, action: SurveyAction<SurveyActionType.FINAL_NOTE_SUBMITTED>) => {
  if (!state.initialized) return state;
  switch (action.payload.modelType) {
    case ChatModelType.SECTION: {
      const updatedSections = state.submission.sections.map(section =>
        section.id === action.payload.modelId
          ? {
              ...section,
              chats: Object.entries(section.chats).reduce(
                (acc, [key, value]) =>
                  key === action.payload.chatType && value
                    ? {
                        ...acc,
                        [key]: {
                          ...value,
                          finalNoteSubmittedAt: new Date().toISOString(),
                        },
                      }
                    : { ...acc, [key]: value },
                {}
              ),
            }
          : section
      );
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section:
            state.navigation.section?.data.id === action.payload.modelId
              ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
              : state.navigation.section,
        },
      } as SurveyState;
    }
    case ChatModelType.QUESTION: {
      const updatedSections = state.submission.sections.map(section => ({
        ...section,
        questions: section.questions.map(question =>
          question.id === action.payload.modelId
            ? {
                ...question,
                chats: Object.entries(question.chats).reduce(
                  (acc, [key, value]) =>
                    key === action.payload.chatType && value
                      ? {
                          ...acc,
                          [key]: {
                            ...value,
                            finalNoteSubmittedAt: new Date().toISOString(),
                          },
                        }
                      : { ...acc, [key]: value },
                  {}
                ),
              }
            : question
        ),
      }));
      return {
        ...state,
        submission: { ...state.submission, sections: updatedSections },
        navigation: {
          ...state.navigation,
          section: state.navigation.section
            ? { ...state.navigation.section, data: updatedSections[state.navigation.section.index] }
            : null,
          question:
            state.navigation.section && state.navigation.question?.data.id === action.payload.modelId
              ? {
                  ...state.navigation.question,
                  data: updatedSections[state.navigation.section.index].questions[state.navigation.question.index],
                }
              : state.navigation.question,
        },
      } as SurveyState;
    }
    default:
      return state;
  }
};

export const surveyReducer = (state: SurveyState, action: SurveyAction): SurveyState => {
  if (action.type === SurveyActionType.INITIALIZE) {
    return onInitialize(action);
  }
  if (!state.initialized) return state;

  switch (action.type) {
    case SurveyActionType.NEXT_PAGE:
      return onNextPage(state);
    case SurveyActionType.PREVIOUS_PAGE:
      return onPreviousPage(state);
    case SurveyActionType.SET_ANSWER:
      return onSetAnswer(state, action);
    case SurveyActionType.SET_RESULT:
      return onSetResult(state, action);
    case SurveyActionType.SET_SECTION:
      return onSetSection(state, action);
    case SurveyActionType.SET_AVATAR:
      return onSetAvatar(state, action);
    case SurveyActionType.ADD_MESSAGE: {
      let updatedState = state as SurveyState;
      if (action.payload.messageToRemove != null) {
        updatedState = onRemoveChatMessage(updatedState, {
          type: SurveyActionType.REMOVE_MESSAGE,
          payload: {
            ...action.payload,
            messageToRemove: action.payload.messageToRemove,
          },
        });
      }
      return onAddChatMessages(updatedState, {
        ...action,
        type: SurveyActionType.ADD_MESSAGES,
        payload: { ...action.payload, messages: [action.payload.message] },
      });
    }
    case SurveyActionType.ADD_MESSAGES: {
      let updatedState = state as SurveyState;
      if (action.payload.messageToRemove != null) {
        updatedState = onRemoveChatMessage(updatedState, {
          type: SurveyActionType.REMOVE_MESSAGE,
          payload: {
            ...action.payload,
            messageToRemove: action.payload.messageToRemove,
          },
        });
      }
      return onAddChatMessages(updatedState, action);
    }
    case SurveyActionType.REMOVE_LAST_USER_MESSAGE_FROM_CURRENT_CHAT: {
      switch (state.navigation.active) {
        case ActiveSurveyPage.QUESTION: {
          if (!state.navigation.question.data.chats.followUp) return state;
          const lastMessage =
            state.navigation.question.data.chats.followUp.messages[
              state.navigation.question.data.chats.followUp.messages.length - 1
            ];
          return lastMessage?.role === ChatRole.USER
            ? onRemoveChatMessage(state, {
                type: SurveyActionType.REMOVE_MESSAGE,
                payload: {
                  modelType: ChatModelType.QUESTION,
                  modelId: state.navigation.question.data.id,
                  chatType: ChatType.FOLLOW_UP,
                  messageToRemove: lastMessage.id,
                  isClosed: false,
                  isThinking: false,
                },
              })
            : state;
        }
        case ActiveSurveyPage.SECTION: {
          if (!state.navigation.section.data.chats.discussion) return state;
          const lastMessage =
            state.navigation.section.data.chats.discussion.messages[
              state.navigation.section.data.chats.discussion.messages.length - 1
            ];
          return lastMessage.role === ChatRole.USER
            ? onRemoveChatMessage(state, {
                type: SurveyActionType.REMOVE_MESSAGE,
                payload: {
                  modelType: ChatModelType.SECTION,
                  modelId: state.navigation.section.data.id,
                  chatType: ChatType.DISCUSSION,
                  messageToRemove: lastMessage.id,
                  isClosed: false,
                  isThinking: false,
                },
              })
            : state;
        }
        default:
          return state;
      }
    }
    case SurveyActionType.REMOVE_MESSAGE: {
      return onRemoveChatMessage(state, action);
    }
    case SurveyActionType.MESSAGE_TYPED: {
      return onMessageTyped(state, action);
    }
    case SurveyActionType.CLOSE_CHAT: {
      return onCloseChat(state, action);
    }
    case SurveyActionType.FINAL_NOTE_SUBMITTED: {
      return onFinalNoteSubmitted(state, action);
    }
    case SurveyActionType.PRIVACY_CONSENT_GIVEN: {
      return {
        ...state,
        submission: {
          ...state.submission,
          privacyConsentGivenAt: action.payload.privacyConsentGivenAt,
          expiresAt: action.payload.expiresAt,
        },
      };
    }
    default:
      return state;
  }
};
