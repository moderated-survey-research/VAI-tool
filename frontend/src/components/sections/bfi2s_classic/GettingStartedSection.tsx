import { Card } from "@nextui-org/react";
import React from "react";

const GettingStartedSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-large">
          We appreciate having you as a participant. This survey is about exploring your personality traits and how they
          influence your thoughts, behaviors, and everyday life. In all questions, we are looking for your unique
          personal perspective, there are no right or wrong answers. Take your time and be honest. We hope you will
          enjoy the process.
        </p>
      </div>

      <Card className="space-y-2 p-4 bg-transparent">
        <h2 className="text-xl font-medium flex items-center">📋 What to Expect</h2>
        <ul className="list-disc list-inside pl-4">
          <li>
            <span className="font-medium">Profiling:</span> Fill in a few questions about yourself.
          </li>
          <li>
            <span className="font-medium">Personality Assessment:</span> Answer a series of questions designed to
            uncover key personality traits and patterns.
          </li>
          <li>
            <span className="font-medium">Your Results:</span> Get a summary of your personality profile based on your
            responses.
          </li>
          <li>
            <span className="font-medium">Feedback:</span> Share your thoughts about the survey experience.
          </li>
        </ul>
      </Card>

      <Card className="space-y-2 p-4 bg-transparent">
        <h2 className="text-xl font-medium flex items-center">🤖 Interactive Assistance</h2>
        <p>Our AI Assistant is here to guide you through the survey. You will see it pop up from time to time to:</p>
        <ul className="list-disc list-inside pl-4">
          <li>Ask you some follow-up questions so we better understand your answers.</li>
          <li>Clarify anything you'd like to ask about before we start.</li>
          <li>Assist in interpreting your results.</li>
        </ul>
        <span className="font-semibold">Interacting with the AI assistant is a required part of the experience.</span>
      </Card>

      <Card className="space-y-2 p-4 bg-transparent">
        <h2 className="text-xl font-medium flex items-center">📝 Guidelines</h2>
        <p>To ensure a smooth interaction with your AI assistant, please keep the following in mind:</p>
        <ul className="list-disc list-inside pl-4">
          <li>
            <span className="font-medium">Stay on Topic:</span> When the assistant asks you a question, keep your
            responses relevant.
          </li>
          <li>
            <span className="font-medium">Provide Detailed Answers:</span> Avoid overly short responses. Thoughtful and
            clear answers help improve the experience.
          </li>
          <li>
            <span className="font-medium">Processing Times:</span> Some responses may take a moment to process. Please
            be patient.
          </li>
        </ul>
      </Card>

      <Card className="space-y-2 p-4 bg-transparent">
        <h2 className="text-xl font-medium flex items-center">⏳ Time Commitment</h2>
        <p>
          Completing the survey will take approximately <span className="font-medium">15-25 minutes</span>. Your time
          and effort are greatly appreciated!
        </p>
      </Card>
    </div>
  );
};

export default GettingStartedSection;
