const DEFAULT_API_BASE_URL = '/api/v1';
const DEFAULT_TIMEOUT_MS = 10000;

const parseString = (value, fallback = '') => {
  const normalized = String(value ?? fallback).trim();
  return normalized;
};

const parseBoolean = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase() === 'true';

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const env = import.meta.env ?? {};

const appConfig = Object.freeze({
  mode: env.MODE ?? 'development',
  apiBaseUrl: parseString(env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
  apiTimeoutMs: parseNumber(env.VITE_API_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  useRemoteApi: parseBoolean(env.VITE_USE_REMOTE_API),
});

export { appConfig };
