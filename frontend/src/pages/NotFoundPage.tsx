import SurveyLayout from "@/layouts/SurveyLayout";
import ErrorPage from "./ErrorPage";

const NotFoundPage: React.FC = () => {
  return (
    <SurveyLayout>
      <ErrorPage code={404} />
    </SurveyLayout>
  );
};

export default NotFoundPage;
