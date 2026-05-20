// src/hooks/useEventCover.js
//
// Single cover-image picker + uploader for events. Mirrors the avatar flow:
// pick → sign → upload to Cloudinary → return secure_url.

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import * as eventApi from '../api/event';

export function useEventCover(initial = '') {
  const [coverImage, setCoverImage] = useState(initial || '');
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        'Photo library access is needed to add a cover image.',
      );
      return false;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.[0]) return false;

    const asset = result.assets[0];
    setIsUploading(true);
    try {
      const sig = await eventApi.signEventUpload();

      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'event.jpg',
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
      setCoverImage(versioned);
      return true;
    } catch (e) {
      Alert.alert('Upload failed', e?.message || 'Could not upload image');
      return false;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearCover = useCallback(() => setCoverImage(''), []);

  return { coverImage, setCoverImage, pickAndUpload, clearCover, isUploading };
}