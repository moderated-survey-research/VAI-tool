import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import Countdown from "react-countdown";

export interface TimerHandle {
  handleExtendTime: (minutes: number) => void;
  handlePause: () => void;
  handleStart: () => void;
}

interface TimerProps {
  initialSecondsCount: number;
  onComplete: () => void;
  showLastSecondsOnly?: number;
}

const CountdownTimer = forwardRef<TimerHandle, TimerProps>(
  ({ initialSecondsCount, onComplete, showLastSecondsOnly }, ref) => {
    const [startDate, setStartDate] = useState(Date.now() + initialSecondsCount * 1000);
    const countdownRef = useRef<Countdown>(null);

    useImperativeHandle(ref, () => ({
      handleExtendTime(minutes: number) {
        setStartDate(Date.now() + (startDate - Date.now()) + minutes * 60 * 1000);
      },
      handlePause() {
        countdownRef.current?.api?.pause();
      },
      handleStart() {
        countdownRef.current?.api?.start();
      },
    }));

    return (
      <Countdown
        onComplete={onComplete}
        intervalDelay={0}
        date={startDate}
        renderer={props => (
          <>
            {!showLastSecondsOnly || props.total / 1000 < showLastSecondsOnly + 1 ? (
              <p>
                {initialSecondsCount / 3600 >= 1 ? `${String(props.hours).padStart(2, "0")}:` : null}
                {initialSecondsCount / 60 >= 1 ? `${String(props.minutes).padStart(2, "0")}:` : null}
                {`${String(props.seconds).padStart(2, "0")}`}
              </p>
            ) : null}
          </>
        )}
        ref={countdownRef}
      />
    );
  }
);

CountdownTimer.displayName = "CountdownTimer";

export default CountdownTimer;
