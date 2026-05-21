// src/api/user.js

import client from './client';

// GET /api/users/:id — public profile (email stripped server-side).
export async function fetchPublicProfile(id) {
  const res = await client.get(`/api/users/${id}`);
  return res.data.data;
}