import SurveyLayout from "@/layouts/SurveyLayout";
import ErrorPage from "./ErrorPage";

const TerminationPage: React.FC = () => {
  return (
    <SurveyLayout>
      <ErrorPage
        code={403}
        message="Unfortunately, your survey session has been terminated due to repeated invalid responses. To ensure the quality and reliability of our data, we had to end the survey."
        canGoBack={false}
      />
    </SurveyLayout>
  );
};

export default TerminationPage;
