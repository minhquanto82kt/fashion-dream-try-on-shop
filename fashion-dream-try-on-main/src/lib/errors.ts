export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "PAYMENT_ERROR"
  | "AI_ERROR"
  | "STORAGE_ERROR"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    status = 500,
    cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export function toAppError(error: unknown, fallback = "Đã xảy ra lỗi không xác định.") {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError("INTERNAL_ERROR", error.message || fallback, 500, error);
  }
  return new AppError("INTERNAL_ERROR", fallback, 500, error);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
