import { HttpStatusCode } from "axios";

export interface ApiError {
  status: HttpStatusCode;
  code: string;
  message: string;
}
