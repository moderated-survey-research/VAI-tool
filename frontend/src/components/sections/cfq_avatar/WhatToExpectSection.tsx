const WhatToExpectSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <p>
        The following psychological questionnaire allows us to understand more about your cognition. You will be shown
        some questions about things that happen to you in your everyday life.
      </p>
      <div>
        <p className="mb-2">
          Choose an option depending on how often each situation occurred to you in the past{" "}
          <span className="font-medium">past 6 months</span>:
        </p>
        <ul className="list-disc list-inside pl-4">
          <li>
            <span className="font-medium">Very often</span>
          </li>
          <li>
            <span className="font-medium">Quite often</span>
          </li>
          <li>
            <span className="font-medium">Occasionally</span>
          </li>
          <li>
            <span className="font-medium">Very rarely</span>
          </li>
          <li>
            <span className="font-medium">Never</span>
          </li>
        </ul>
      </div>
      <p>Take your time and select the option that feels most accurate.</p>

      <p className="font-bold">
        💡 Before you begin, try having a short conversation with the AI assistant to get comfortable. Once you're
        familiar with how it works, you can proceed with the assessment by clicking the "Continue" button. If needed,
        you can minimize the assistant using the chat icon at the bottom right.
      </p>
    </div>
  );
};

export default WhatToExpectSection;
