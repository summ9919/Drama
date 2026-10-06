import { appConfig } from '../constants/config';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!appConfig.apiBaseUrl) throw new Error('API base URL is not configured yet.');
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}
