// packages/types/src/index.ts
export * from './database.types';

export interface ApiSuccessResponse<T> {
  data: T;
  error: null;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
  meta?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
