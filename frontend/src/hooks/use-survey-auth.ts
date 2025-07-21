import { useContext } from "react";
import { SurveyAuthContext } from "@/context/SurveyAuthContext";

export const useSurveyAuth = () => {
  const context = useContext(SurveyAuthContext);
  if (!context) {
    throw new Error("useSurveyAuth must be used within an SurveyAuthProvider");
  }
  return context;
};
