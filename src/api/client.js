import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const tokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setTokens(accessToken, refreshToken) {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the access token to every request except /refresh.
client.interceptors.request.use(async (config) => {
  if (!config.url?.includes('/auth/refresh')) {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Coalesced refresh — when one refresh is in flight, all other 401 retries
// await the same promise instead of firing duplicates.
let refreshPromise = null;
// Subscribers for "logged out" event so the auth store can react.
const logoutSubscribers = new Set();
export function onLogout(cb) {
  logoutSubscribers.add(cb);
  return () => logoutSubscribers.delete(cb);
}

async function performRefresh() {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });
    if (res.data?.success) {
      const { accessToken, refreshToken: newRefresh } = res.data.data;
      await tokenStorage.setTokens(accessToken, newRefresh);
      return true;
    }
  } catch (e) {
    if (__DEV__) console.log('Refresh failed:', e?.response?.data || e.message);
  }
  return false;
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isRefreshCall && !original._retried) {
      original._retried = true;

      // Coalesce: if a refresh is in flight, await it; otherwise start one.
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;

      if (refreshed) {
        const token = await tokenStorage.getAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      }

      // Refresh failed — tokens are bad, log the user out.
      await tokenStorage.clearTokens();
      logoutSubscribers.forEach((cb) => cb());
    }

    return Promise.reject(error);
  }
);

export default client;