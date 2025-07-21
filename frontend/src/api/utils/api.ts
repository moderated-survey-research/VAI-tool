import axios, { AxiosRequestConfig, AxiosError, AxiosRequestHeaders } from "axios";
import { baseAxiosInstance, heygenAxiosInstance } from "@/api/axios";
import { logger } from "./logger";
import { ServerError } from "@/api/errors";
import { ApiError } from "@/types/error";
import { useNavigate } from "react-router-dom";
import { surveyTokenStorage } from "@/utils/survey.token";
import { useError } from "@/hooks/use-error";
import toast from "react-hot-toast";
import { ERROR_CODES } from "@/lib/error";

type RequestConfig<B> = AxiosRequestConfig<B> & {
  method?: "PUT" | "POST" | "GET" | "DELETE";
  headers?: AxiosRequestHeaders | null;
};

export const useApi = (api: "BASE" | "HEYGEN" = "BASE") => {
  const navigate = useNavigate();
  const { setError } = useError();
  const apiLogger = logger.get(`${api} API`);

  const fetchApi = async <T = undefined, B = undefined>(
    path: string,
    token: string | null = null,
    config: RequestConfig<B> | null = null
  ) => {
    const headers = new axios.AxiosHeaders({
      "Content-Type": "application/json",
      ...config?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    apiLogger.info(config?.method ?? "GET", path, {
      ...config,
      headers: {
        ...config?.headers,
        ...headers,
      },
    });

    const axiosInstance = api === "BASE" ? baseAxiosInstance : heygenAxiosInstance;

    return await axiosInstance
      .request<T>({
        url: path,
        ...config,
        headers,
      })
      .then(response => {
        apiLogger.success(response.status, response.data);
        return response.data;
      })
      .catch((error: unknown) => {
        let apiError: ApiError;
        if (error instanceof AxiosError) {
          if (error.status) {
            apiError = ServerError.fromStatus(
              error.status,
              error.response?.data?.errors?.[0]?.detail ?? error.response?.data?.message ?? error.message,
              error.response?.data?.errors?.[0]?.code ?? error.response?.data?.code ?? error.code
            );
          } else {
            apiError = ServerError.unavailable();
          }
        } else {
          apiError = ServerError.internalServerError("Something went wrong");
        }
        apiLogger.error(apiError.status, apiError.message);
        setError(apiError);

        const currentRoute = window.location.pathname;
        const shouldRedirect = currentRoute.includes("/surveys");

        if (shouldRedirect) {
          switch (api) {
            case "BASE":
              if (apiError.status > 500) navigate("/500");
              else if (apiError.status === 401 || apiError.code === ERROR_CODES.SURVEY_TERMINATION) {
                if (token) surveyTokenStorage.deleteToken(token);
                if (apiError.code === ERROR_CODES.SURVEY_TERMINATION) navigate("/termination");
                else navigate("/401");
              } else if (apiError.code === ERROR_CODES.SURVEY_DUPLICATE_SUBMISSION) {
                navigate("/duplicate");
              } else if (apiError.status === 404) {
                navigate("/404");
              } else if (apiError.status === 429) {
                navigate("/429");
              } else {
                toast.error(apiError.message);
              }
              break;
            case "HEYGEN":
              break;
          }
        }

        if ((apiError.status === 401 || apiError.code === ERROR_CODES.SURVEY_TERMINATION) && token) {
          surveyTokenStorage.deleteToken(token);
        }

        throw apiError;
      });
  };

  return {
    fetchApi,
  };
};
