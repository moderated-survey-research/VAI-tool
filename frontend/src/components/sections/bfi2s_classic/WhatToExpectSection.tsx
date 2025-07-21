const WhatToExpectSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <p>
        The following psychological questionnaire allows us to understand more about your personality. You will be shown
        some statements that will try to describe you from a third-person perspective.
      </p>
      <div>
        <p className="mb-2">Choose an option depending on how much you agree or disagree with each statement:</p>
        <ul className="list-disc list-inside pl-4">
          <li>
            <span className="font-medium">Agree strongly</span>
          </li>
          <li>
            <span className="font-medium">Agree a little</span>
          </li>
          <li>
            <span className="font-medium">Neutral, no opinion</span>
          </li>
          <li>
            <span className="font-medium">Disagree a little</span>
          </li>
          <li>
            <span className="font-medium">Disagree strongly</span>
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
