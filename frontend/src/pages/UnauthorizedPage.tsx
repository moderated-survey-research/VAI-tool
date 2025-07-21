import SurveyLayout from "@/layouts/SurveyLayout";
import ErrorPage from "./ErrorPage";

const UnauthorizedPage: React.FC = () => {
  return (
    <SurveyLayout>
      <ErrorPage
        code={401}
        message="Your survey session has expired because it remained inactive for too long. To ensure fairness and data integrity, sessions are automatically closed after a period of inactivity. "
        canGoBack={false}
      />
    </SurveyLayout>
  );
};

export default UnauthorizedPage;
