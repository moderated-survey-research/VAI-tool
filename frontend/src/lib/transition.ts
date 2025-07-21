export const SURVEY_TRANSITIONS = {
  ease_in_out_500: {
    enter: "ease-in-out duration-500",
    enterFrom: "opacity-0",
    enterTo: "opacity-100",
    leave: "ease-in-out duration-500",
    leaveFrom: "opacity-100",
    leaveTo: "opacity-0",
  },
  chat: {
    enter: "transition-opacity transition-transform duration-500 ease-in-out",
    enterFrom: "opacity-0 scale-y-0 origin-bottom",
    enterTo: "opacity-100 scale-y-full origin-bottom",
    leave: "transition-opacity transition-transform duration-500 ease-in-out",
    leaveFrom: "opacity-100 scale-y-full origin-bottom",
    leaveTo: "opacity-0 scale-y-0 origin-bottom",
  },
  avatar: {
    enter: "transition-opacity transition-transform duration-500 ease-in-out",
    enterFrom: "opacity-0 scale-y-0 origin-bottom",
    enterTo: "opacity-100 scale-y-full origin-bottom",
    leave: "transition-opacity transition-transform duration-500 ease-in-out",
    leaveFrom: "opacity-100 scale-y-full origin-bottom",
    leaveTo: "opacity-0 scale-y-0 origin-bottom",
  },
};
