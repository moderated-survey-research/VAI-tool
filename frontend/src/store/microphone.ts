import { MicrophoneAction } from "@/types/store/microphone.actions";
import { MicrophoneAccessState } from "@/types/store/microphone.state";

export const microphoneReducer = (state: MicrophoneAccessState, action: MicrophoneAction): MicrophoneAccessState => {
  switch (action.type) {
    case "MICROPHONE_ACCESS":
      return action.payload;
    default:
      return state;
  }
};
