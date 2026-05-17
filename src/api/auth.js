import client from './client';

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
    await client.post('/api/auth/logout');
  } catch {
    // Ignore — logout client-side regardless
  }
}