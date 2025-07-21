import CountdownTimer from "@/components/other/CountdownTimer";
import { useMicrophone } from "@/hooks/use-microphone";
import { Button, Spinner } from "@nextui-org/react";
import { Microphone } from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import { LiveAudioVisualizer } from "react-audio-visualize";

const MicrophoneCheckSection: React.FC = () => {
  const { microphoneAccess } = useMicrophone({ isRequired: true });
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [fakeMediaRecorder, setFakeMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = () => {
    if (!mediaRecorder) return;
    setIsRecording(true);
    setIsPlaying(false);
    setRecordingStarted(true);
    mediaRecorder.start();
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
  };

  useEffect(() => {
    const initMediaRecorder = async () => {
      if (!mediaRecorder && microphoneAccess) {
        let audioChunks: Blob[] = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        recorder.onstop = async () => {
          setIsRecording(false);
          if (audioChunks.length === 0) return;
          setIsPlaying(true);
          const blob = new Blob(audioChunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          const audioContext = new AudioContext();
          const source = audioContext.createBufferSource();
          const analyser = audioContext.createAnalyser();
          const destination = audioContext.createMediaStreamDestination();
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          source.buffer = audioBuffer;
          source.connect(analyser);
          analyser.connect(destination);
          const fakeRecorder = new MediaRecorder(destination.stream);
          setFakeMediaRecorder(fakeRecorder);

          source.start();
          fakeRecorder.start();
          audio.play();

          audio.onended = () =>
            setTimeout(() => {
              audioChunks = [];
              setIsPlaying(false);
            }, 250);
        };

        setMediaRecorder(recorder);
      }
    };

    initMediaRecorder();
  }, [mediaRecorder, microphoneAccess]);

  return (
    <div className="flex flex-col w-3/4 mx-auto gap-6 mt-4">
      {!microphoneAccess ? (
        <>
          <div className="flex flex-row w-full justify-start gap-4">
            <Microphone size={48} />
            <Spinner color="primary" size="lg" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Accessing microphone devices...</p>
            <p className="font-light text-secondary">
              Please give us permission to use your <strong>microphone</strong> when prompted.
            </p>
          </div>
        </>
      ) : (
        <>
          {isRecording && mediaRecorder ? (
            <>
              <div className="flex flex-row w-full justify-start items-center gap-4">
                <Microphone size={48} />
                <LiveAudioVisualizer mediaRecorder={mediaRecorder} barColor="#6C5CE7" height={36} width={200} />
              </div>
              <div className="flex flex-row">
                <p className="font-medium">Recording will stop in&nbsp;</p>
                <span className="text-primary font-medium">
                  <CountdownTimer initialSecondsCount={5} onComplete={stopRecording} />
                </span>
                <p className="font-medium">&nbsp;seconds...</p>
              </div>
            </>
          ) : null}

          {isPlaying && fakeMediaRecorder ? (
            <>
              <div className="flex flex-row w-full justify-start items-center gap-4">
                <Microphone size={48} />
                <LiveAudioVisualizer mediaRecorder={fakeMediaRecorder} barColor="#6C5CE7" height={36} width={200} />
              </div>
              <div className="flex flex-row">
                <p className="font-medium">Playing audio...</p>
              </div>
            </>
          ) : null}

          {!isRecording && !isPlaying ? (
            <>
              {recordingStarted ? (
                <>
                  <div className="flex flex-row w-full justify-start items-center gap-4">
                    <Microphone size={48} />
                    <Button color="default" onPress={startRecording}>
                      Restart test
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">Did you hear your voice loud enough?</p>
                    <p className="font-light text-secondary">
                      If so, click <strong>Continue</strong>. If not, check your microphone settings and click{" "}
                      <strong>Restart test</strong>.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-row w-full justify-start items-center gap-4">
                    <Microphone size={48} />
                    <Button color="default" onPress={startRecording}>
                      Start test
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">Test your microphone</p>
                    <p className="font-light text-secondary">
                      Click <strong>Start test</strong> and say out loud: "
                      <strong>I am ready to begin this study</strong>
                      ."
                    </p>
                  </div>
                </>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
};

export default MicrophoneCheckSection;
