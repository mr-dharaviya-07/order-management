import type { AuthSession, Category, DashboardStats, MenuItem, Order, OrderStatus } from '../types';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path, API_URL);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function fetchJson<T>(path: string, options: RequestInit & { params?: QueryParams } = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, options.params), {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      const token = useAuthStore.getState().accessToken;
      useAuthStore.getState().logout();
      if (token) {
        toast.error('Session expired. Please login again.');
      }
    }
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(', ')
          : String(payload.message)
        : 'Request failed';
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const menuApi = {
  list: (params?: QueryParams) => fetchJson<MenuItem[]>('/menu', { params }),
  categories: () => fetchJson<Category[]>('/menu/categories'),
  createCategory: (payload: { name: string; description?: string }) =>
    fetchJson<Category>('/menu/categories', { method: 'POST', body: JSON.stringify(payload) }),
  create: (payload: Partial<MenuItem>) =>
    fetchJson<MenuItem>('/menu', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<MenuItem>) =>
    fetchJson<MenuItem>(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: string) => fetchJson<{ ok: boolean }>(`/menu/${id}`, { method: 'DELETE' }),
};

export const ordersApi = {
  create: (payload: unknown) =>
    fetchJson<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  list: (params?: QueryParams) => fetchJson<Order[]>('/orders', { params }),
  one: (id: string) => fetchJson<Order>(`/orders/${id}`),
  status: (id: string, status: OrderStatus) =>
    fetchJson<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancel: (id: string) => fetchJson<Order>(`/orders/${id}`, { method: 'DELETE' }),
};

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    fetchJson<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { name: string; email: string; password: string; role?: string }) =>
    fetchJson<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
};

export const dashboardApi = {
  stats: () => fetchJson<DashboardStats>('/dashboard/stats'),
};
