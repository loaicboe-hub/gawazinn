import type { ApiResponse } from '@shared/types';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE = '/api/v1';

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiClientError(
      response.status,
      'NO_JSON_BACKEND',
      'API server did not return JSON',
    );
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.ok) {
    const err = payload.ok
      ? { code: 'HTTP_ERROR', message: `Request failed with ${response.status}` }
      : payload.error;
    throw new ApiClientError(response.status, err.code, err.message, err.details);
  }

  return payload.data;
}

