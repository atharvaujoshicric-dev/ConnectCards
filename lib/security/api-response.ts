// lib/security/api-response.ts
// Consistent { data, error, meta } envelope for every API route, plus a
// stable internal error-code taxonomy so clients never need to parse raw
// Postgres or provider error messages.

import { NextResponse } from 'next/server';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/index';

export const API_ERROR_CODES = {
  VALIDATION_FAILED: 'validation_failed',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  RATE_LIMITED: 'rate_limited',
  PLAN_UPGRADE_REQUIRED: 'plan_upgrade_required',
  INTERNAL_ERROR: 'internal_error',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  validation_failed: 422,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  plan_upgrade_required: 402,
  internal_error: 500,
};

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data, error: null, meta });
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { data: null, error: { code, message, fieldErrors } },
    { status: STATUS_BY_CODE[code] },
  );
}
