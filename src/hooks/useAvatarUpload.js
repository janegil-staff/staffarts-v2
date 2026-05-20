// src/hooks/useAvatarUpload.js
//
// Encapsulates the full avatar upload flow:
//   1. Open photo library (expo-image-picker)
//   2. Request a Cloudinary signature from our API
//   3. Upload the file directly to Cloudinary (multipart form-data)
//   4. Send the resulting URL back to our API to save on the user
//   5. Update the auth store with the new user object
//
// Returns: { pickAndUpload, isUploading, error }

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import * as profileApi from '../api/profile';
import { useAuthStore } from '../stores/authStore';

export function useAvatarUpload() {
  const setUser = useAuthStore((s) => s.setUser);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const pickAndUpload = useCallback(async () => {
    setError(null);

    // ── 1. Permissions ────────────────────────────────────────────
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        'Photo library access is needed to set an avatar.',
      );
      return false;
    }

    // ── 2. Pick image ─────────────────────────────────────────────
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return false;

    const asset = result.assets[0];

    setIsUploading(true);
    try {
      // ── 3. Get signature from our API ────────────────────────
      const sig = await profileApi.signAvatarUpload();

      // ── 4. Upload directly to Cloudinary ─────────────────────
      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'avatar.jpg',
      });
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('folder', sig.folder);
      form.append('public_id', sig.publicId);
      form.append('overwrite', String(sig.overwrite));
      form.append('transformation', sig.transformation);
      form.append('signature', sig.signature);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const uploadResp = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: form,
      });
      const uploadJson = await uploadResp.json();
      if (!uploadResp.ok || !uploadJson.secure_url) {
        throw new Error(
          uploadJson?.error?.message || 'Cloudinary upload failed',
        );
      }

      // Cloudinary caches aggressively; append a version querystring so the
      // new image is fetched instead of the previous one (same public_id
      // means same URL otherwise).
      const versioned = uploadJson.version
        ? `${uploadJson.secure_url}?v=${uploadJson.version}`
        : uploadJson.secure_url;

      // ── 5. Save the URL on our user ──────────────────────────
      const updatedUser = await profileApi.saveAvatarUrl(versioned);
      setUser(updatedUser);
      return true;
    } catch (e) {
      const msg =
        e?.response?.data?.error || e?.message || 'Avatar upload failed';
      setError(msg);
      Alert.alert('Upload failed', msg);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [setUser]);

  return { pickAndUpload, isUploading, error };
}