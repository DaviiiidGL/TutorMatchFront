const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!res.ok) {
    // Intentamos leer el error que manda el back
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  // 204 No Content no tiene body
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get:    <T>(url: string)                  => request<T>(url, 'GET'),
  post:   <T>(url: string, body: unknown)   => request<T>(url, 'POST', body),
  put:    <T>(url: string, body: unknown)   => request<T>(url, 'PUT', body),
  patch:  <T>(url: string, body?: unknown)  => request<T>(url, 'PATCH', body),
  delete: <T>(url: string)                  => request<T>(url, 'DELETE'),
};