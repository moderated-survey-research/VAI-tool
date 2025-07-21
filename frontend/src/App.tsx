import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SurveyPage from "./pages/SurveyPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import InternalServerErrorPage from "./pages/InternalServerErrorPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ThankYouPage from "./pages/ThankYouPage";
import ErrorProvider from "./context/ErrorContext";
import SurveyAuthProvider from "./context/SurveyAuthContext";
import { Toaster } from "react-hot-toast";
import TerminationPage from "./pages/TerminationPage";
import ServiceLimitReachedPage from "./pages/ServiceLimitReachedPage";
import SurveyDuplicateSubmissionPage from "./pages/SurveyDuplicateSubmissionPage";
import DeviceRestriction from "./components/other/DeviceRestriction";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <Routes>
            <Route index element={<HomePage />} />
            <Route
              path="/surveys/:id"
              element={
                <DeviceRestriction>
                  <SurveyAuthProvider>
                    <SurveyPage />
                  </SurveyAuthProvider>
                </DeviceRestriction>
              }
            />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/401" element={<UnauthorizedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/429" element={<ServiceLimitReachedPage />} />
            <Route path="/500" element={<InternalServerErrorPage />} />
            <Route path="/termination" element={<TerminationPage />} />
            <Route path="/duplicate" element={<SurveyDuplicateSubmissionPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster position="bottom-center" />
        </ErrorProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
