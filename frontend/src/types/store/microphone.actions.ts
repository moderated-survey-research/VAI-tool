import { MicrophoneAccessState } from "./microphone.state";

export enum MicrophoneActionType {
  MICROPHONE_ACCESS = "MICROPHONE_ACCESS",
}

interface MicrophoneActionPayloads {
  [MicrophoneActionType.MICROPHONE_ACCESS]: MicrophoneAccessState;
}

export type MicrophoneAction<T extends MicrophoneActionType = MicrophoneActionType> = T extends T
  ? {
      type: T;
      payload: MicrophoneActionPayloads[T];
    }
  : never;
