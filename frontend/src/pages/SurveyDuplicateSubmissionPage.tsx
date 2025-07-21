import SurveyLayout from "@/layouts/SurveyLayout";
import ErrorPage from "./ErrorPage";

const SurveyDuplicateSubmissionPage: React.FC = () => {
  return (
    <SurveyLayout>
      <ErrorPage
        code={409}
        canGoBack={false}
        message="You've already completed this survey. Duplicate submissions aren't allowed. Thank you for your participation!"
      />
    </SurveyLayout>
  );
};

export default SurveyDuplicateSubmissionPage;
