import React, { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { surveyTokenStorage } from "@/utils/survey.token";
import { useSubmissionService } from "@/api/services/submission.service";
import { useQuery } from "@tanstack/react-query";
import { fingerprintUtil } from "@/utils/fingerprint";

type ContextType = {
  surveyId: number | string;
  token: string;
};

export const SurveyAuthContext = createContext<ContextType | null>(null);

const SurveyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initiateSurveyEnabled, setInitiateSurveyEnabled] = useState(false);
  const [auth, setAuth] = useState<ContextType | null>(null);
  const { initiateSurvey } = useSubmissionService(null);

  const { data: authData } = useQuery({
    queryKey: ["initiateSurvey", id],
    queryFn: async () => {
      if (!id) return null;
      const fingerprint = await fingerprintUtil.getFingerprint();
      const guid = searchParams.get("guid");
      return initiateSurvey(id, fingerprint, guid != null && guid.length <= 255 && guid.length > 0 ? guid : null);
    },
    enabled: initiateSurveyEnabled && !!id,
  });

  useEffect(() => {
    if (authData && id) {
      surveyTokenStorage.saveToken(id, authData.token);
      setAuth(authData);
      setInitiateSurveyEnabled(false);
    }
  }, [authData, id]);

  useEffect(() => {
    if (!id) {
      navigate("/404", { replace: true });
      return;
    }
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token") ?? surveyTokenStorage.getToken(id);

    if (token) {
      surveyTokenStorage.saveToken(id, token);
      setAuth({ surveyId: id, token });
    } else {
      setInitiateSurveyEnabled(true);
    }
  }, [id, location.search, navigate]);

  if (!auth) {
    return null;
  }

  return <SurveyAuthContext.Provider value={auth}>{children}</SurveyAuthContext.Provider>;
};

export default SurveyAuthProvider;
