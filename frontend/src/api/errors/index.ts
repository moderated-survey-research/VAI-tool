import { HttpStatusCode } from "axios";
import { ApiError } from "@/types/error";

export class ServerError {
  static notFound(_reason: string, _code?: string): ApiError {
    return {
      status: HttpStatusCode.NotFound,
      code: _code ? _code : "not_found",
      message: _reason,
    };
  }

  static unauthorized(_reason: string, _code?: string): ApiError {
    return {
      status: HttpStatusCode.Unauthorized,
      code: _code ? _code : "unauthorized",
      message: _reason,
    };
  }

  static forbidden(_reason: string, _code?: string): ApiError {
    return {
      status: HttpStatusCode.Forbidden,
      code: _code ? _code : "forbidden",
      message: _reason,
    };
  }

  static internalServerError(_reason: string, _code?: string): ApiError {
    return {
      status: HttpStatusCode.InternalServerError,
      code: _code ? _code : "internal_server_error",
      message: _reason,
    };
  }

  static badRequest(_reason: string, _code?: string): ApiError {
    return {
      status: HttpStatusCode.BadRequest,
      code: _code ? _code : "bad_request",
      message: _reason,
    };
  }

  static unavailable(): ApiError {
    return {
      status: HttpStatusCode.ServiceUnavailable,
      code: "service_unavailable",
      message: "Service unavailable",
    };
  }

  static fromStatus(status: number, _reason: string, _code?: string): ApiError {
    switch (status) {
      case 400:
        return ServerError.badRequest(_reason, _code);
      case 401:
        return ServerError.unauthorized(_reason, _code);
      case 403:
        return ServerError.forbidden(_reason, _code);
      case 404:
        return ServerError.notFound(_reason, _code);
      default:
        return ServerError.internalServerError(_reason, _code);
    }
  }
}
