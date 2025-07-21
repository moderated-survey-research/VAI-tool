import { microphoneReducer } from "@/store/microphone";
import { MicrophoneActionType } from "@/types/store/microphone.actions";
import { useEffect, useReducer } from "react";
import toast from "react-hot-toast";

export const useMicrophone = ({ isRequired = false }) => {
  const [state, dispatch] = useReducer(microphoneReducer, false);

  const getMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      dispatch({ type: MicrophoneActionType.MICROPHONE_ACCESS, payload: true });
    } catch {
      toast.error("Microphone access is required to continue with the survey.");
      dispatch({ type: MicrophoneActionType.MICROPHONE_ACCESS, payload: false });
    }
  };

  useEffect(() => {
    if (isRequired) getMicrophoneAccess();
  }, [isRequired]);

  return { microphoneAccess: state, getMicrophoneAccess };
};
