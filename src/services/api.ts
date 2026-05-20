import { ENV } from '@/constants/env';
import { getToken, saveToken, removeToken } from '@/services/keychain';

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await getToken('refresh_token');
    if (!refreshToken) return null;

    const res = await fetch(`${ENV.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      await removeToken('access_token');
      await removeToken('refresh_token');
      return null;
    }

    const data = await res.json();
    await saveToken('access_token', data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await getToken('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${ENV.API_URL}${path}`, { ...init, headers });

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retry = await fetch(`${ENV.API_URL}${path}`, { ...init, headers });
      if (!retry.ok) throw new ApiError('Unauthorized', retry.status);
      return retry.json();
    }
    throw new ApiError('Session expired', 401);
  }

  if (!res.ok) {
    const message = await res.text().catch(() => 'Request failed');
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
