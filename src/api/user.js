// src/api/user.js

import client from './client';

// GET /api/users/:id — public profile (email stripped server-side).
// API envelope is { success, data: { user } }, so unwrap to the user object.
export async function fetchPublicProfile(id) {
  const res = await client.get(`/api/users/${id}`);
  return res.data.data.user;
}