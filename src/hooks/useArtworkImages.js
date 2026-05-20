// src/hooks/useArtworkImages.js
//
// Manages a list of artwork images (up to MAX). Each "add" opens the photo
// library, picks one image, uploads it to Cloudinary via a signed URL, and
// appends the resulting secure_url to the list. Multi-image sibling of
// useAvatarUpload.
//
// Returns:
//   images        — string[] of Cloudinary URLs (first = cover)
//   addImage()    — pick + upload one image
//   removeImage(i)— remove the image at index i
//   moveToCover(i)— move image i to the front (becomes the cover)
//   isUploading   — true while an upload is in flight
//   error         — last error message (or null)
//   reset()       — clear all images

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import * as artworkApi from '../api/artwork';

const MAX_IMAGES = 6;

export function useArtworkImages(initial = []) {
  const [images, setImages] = useState(initial);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const addImage = useCallback(async () => {
    setError(null);

    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', `You can add up to ${MAX_IMAGES} images.`);
      return false;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        'Photo library access is needed to add images.',
      );
      return false;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return false;

    const asset = result.assets[0];
    setIsUploading(true);
    try {
      const sig = await artworkApi.signArtworkUpload();

      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'artwork.jpg',
      });
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('folder', sig.folder);
      form.append('public_id', sig.publicId);
      form.append('transformation', sig.transformation);
      form.append('signature', sig.signature);

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const resp = await fetch(url, { method: 'POST', body: form });
      const json = await resp.json();
      if (!resp.ok || !json.secure_url) {
        throw new Error(json?.error?.message || 'Cloudinary upload failed');
      }

      const versioned = json.version
        ? `${json.secure_url}?v=${json.version}`
        : json.secure_url;

      setImages((prev) => [...prev, versioned]);
      return true;
    } catch (e) {
      const msg =
        e?.response?.data?.error || e?.message || 'Image upload failed';
      setError(msg);
      Alert.alert('Upload failed', msg);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [images.length]);

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveToCover = useCallback((index) => {
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  }, []);

  const reset = useCallback(() => setImages([]), []);

  return {
    images,
    addImage,
    removeImage,
    moveToCover,
    isUploading,
    error,
    reset,
    maxImages: MAX_IMAGES,
  };
}