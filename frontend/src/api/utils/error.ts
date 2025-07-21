import { HttpStatusCode } from "axios";
import { ApiError } from "@/types/error";

export class ServerError {
  static notFound(_reason: string, _code: string): ApiError {
    return {
      status: HttpStatusCode.NotFound,
      message: _reason,
      code: _code ? _code : "not_found",
    };
  }

  static unauthorized(_reason: string, _code: string): ApiError {
    return {
      status: HttpStatusCode.Unauthorized,
      message: _reason,
      code: _code ? _code : "unauthorized",
    };
  }

  static forbidden(_reason: string, _code: string): ApiError {
    return {
      status: HttpStatusCode.Forbidden,
      message: _reason,
      code: _code ? _code : "forbidden",
    };
  }

  static internalServerError(_reason: string, _code: string): ApiError {
    return {
      status: HttpStatusCode.InternalServerError,
      message: _reason,
      code: _code ? _code : "internal_server_error",
    };
  }

  static badRequest(_reason: string, _code: string): ApiError {
    return {
      status: HttpStatusCode.BadRequest,
      message: _reason,
      code: _code ? _code : "bad_request",
    };
  }

  static unavailable(): ApiError {
    return {
      status: HttpStatusCode.ServiceUnavailable,
      message: "Service unavailable",
      code: "service_unavailable",
    };
  }

  static fromStatus(status: number, _reason: string, _code: string): ApiError {
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
