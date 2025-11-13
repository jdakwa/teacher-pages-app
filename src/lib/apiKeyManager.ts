/**
 * API Key Manager - Client-side storage for user API keys
 * Uses localStorage for persistence without requiring a database
 */

const API_KEY_STORAGE_KEY = 'teacherpages_api_gateway_key';

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

