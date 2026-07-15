export type AsyncStatus = "idle" | "loading" | "success" | "empty" | "error";

export type AppErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "server"
  | "unknown";

export interface OperationState {
  status: AsyncStatus;
  error: AppError | null;
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly kind: AppErrorKind = "unknown",
    public readonly status?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AppError";
  }
}
