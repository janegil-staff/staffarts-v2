// src/api/profile.js

import client from './client';

export async function updateProfile({ displayName, bio }) {
  const body = {};
  if (displayName !== undefined) body.displayName = displayName;
  if (bio !== undefined) body.bio = bio;
  const res = await client.patch('/api/auth/profile', body);
  return res.data.data.user;
}

export async function signAvatarUpload() {
  const res = await client.post('/api/uploads/avatar/sign');
  return res.data.data; // { cloudName, apiKey, timestamp, folder, publicId, transformation, overwrite, signature }
}

export async function saveAvatarUrl(url) {
  const res = await client.patch('/api/auth/avatar', { url });
  return res.data.data.user;
}

export async function fetchPublicProfile(id) {
  const res = await client.get(`/api/users/${id}`);
  return res.data.data.user;
}