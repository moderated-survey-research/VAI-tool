import { createContext, useState, ReactNode, useCallback } from "react";
import { ApiError } from "@/types/error";

type ContextType = {
  error: ApiError | null;
  setError: (error: ApiError | null) => void;
};

export const ErrorContext = createContext<ContextType | null>(null);

const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<ApiError | null>(null);
  const setErrorCallback = useCallback(() => setError, []);

  return <ErrorContext.Provider value={{ error, setError: setErrorCallback }}>{children}</ErrorContext.Provider>;
};

export default ErrorProvider;
