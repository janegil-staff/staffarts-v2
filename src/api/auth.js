import client, { tokenStorage } from './client';
import * as SecureStore from 'expo-secure-store';

export async function register({ displayName, email, password }) {
  const res = await client.post('/api/auth/register', {
    displayName,
    email,
    password,
  });
  return res.data.data; // { user, accessToken, refreshToken }
}

export async function login({ email, password }) {
  const res = await client.post('/api/auth/login', { email, password });
  return res.data.data;
}

export async function fetchMe() {
  const res = await client.get('/api/auth/me');
  return res.data.data.user;
}

export async function logout() {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    await client.post(
      '/api/auth/logout',
      { refreshToken: refreshToken ?? null },
      { timeout: 3000 }
    );
  } catch (e) {
    if (__DEV__) console.log('Server logout skipped:', e.message);
  }
}