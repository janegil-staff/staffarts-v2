// src/api/artwork.js

import client from './client';

export async function listArtworks({ limit, sort, artist, status } = {}) {
  const params = {};
  if (limit) params.limit = limit;
  if (sort) params.sort = sort;
  if (artist) params.artist = artist;
  if (status) params.status = status;
  const res = await client.get('/api/artworks', { params });
  return res.data.data; // array
}

export async function fetchArtwork(id) {
  const res = await client.get(`/api/artworks/${id}`);
  return res.data.data;
}

export async function createArtwork(payload) {
  const res = await client.post('/api/artworks', payload);
  return res.data.data;
}

export async function updateArtwork(id, payload) {
  const res = await client.patch(`/api/artworks/${id}`, payload);
  return res.data.data;
}

export async function deleteArtwork(id) {
  const res = await client.delete(`/api/artworks/${id}`);
  return res.data.data;
}

export async function signArtworkUpload() {
  const res = await client.post('/api/uploads/artwork/sign');
  return res.data.data; // { cloudName, apiKey, timestamp, folder, publicId, transformation, signature }
}