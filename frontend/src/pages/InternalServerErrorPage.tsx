import SurveyLayout from "@/layouts/SurveyLayout";
import ErrorPage from "./ErrorPage";

const InternalServerErrorPage: React.FC = () => {
  return (
    <SurveyLayout>
      <ErrorPage code={500} />
    </SurveyLayout>
  );
};

export default InternalServerErrorPage;
