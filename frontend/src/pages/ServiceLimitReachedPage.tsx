import SurveyLayout from "@/layouts/SurveyLayout";
import ErrorPage from "./ErrorPage";

const ServiceLimitReachedPage: React.FC = () => {
  return (
    <SurveyLayout>
      <ErrorPage
        code={429}
        message="We're sorry, but our service has reached its usage limit at the moment. Please try again later. We apologize for the inconvenience."
        canGoBack={false}
      />
    </SurveyLayout>
  );
};

export default ServiceLimitReachedPage;
