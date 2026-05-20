// src/screens/profile/EditProfileScreen.js
//
// Edit display name + bio. Tap the avatar to pick a new one (opens photo
// library, uploads to Cloudinary via signed URL, saves on the user
// immediately). After a successful avatar upload, the Save button also
// activates as visual confirmation — tapping Save commits any displayName /
// bio changes and dismisses the screen.

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Camera } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import * as profileApi from '../../api/profile';

function initialOf(user) {
  const c =
    user?.displayName?.trim().charAt(0) ||
    user?.email?.trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

export default function EditProfileScreen() {
  const { colors, fontSize, radius } = useTheme();
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigation = useNavigation();
  const { pickAndUpload, isUploading } = useAvatarUpload();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Tracks whether the user uploaded an avatar in this session. We don't
  // need to remember WHICH image (the auth store already has the new URL)
  // — just whether *something* happened, so we can flip the Save button on.
  const [avatarChanged, setAvatarChanged] = useState(false);

  const textChanged =
    displayName.trim() !== (user?.displayName || '') ||
    bio.trim() !== (user?.bio || '');

  const canSave =
    !isSaving &&
    !isUploading &&
    displayName.trim().length >= 2 &&
    (textChanged || avatarChanged);

  const onPickAvatar = async () => {
    const ok = await pickAndUpload();
    if (ok) setAvatarChanged(true);
  };

  const onSave = async () => {
    setError('');
    if (!canSave) return;
    setIsSaving(true);
    try {
      // Only PATCH /profile if there's actually a text change to send.
      // Avatar was already saved when picked; if only the avatar changed,
      // tapping Save just dismisses.
      if (textChanged) {
        const updated = await profileApi.updateProfile({
          displayName: displayName.trim(),
          bio: bio.trim(),
        });
        setUser(updated);
      }
      navigation.goBack();
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          (t('profileSaveFailed') ?? 'Could not save profile'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const s = makeStyles({ colors, fontSize, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('profileEditTitle') ?? 'Edit profile'}
        left={
          <HeaderIconButton
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('navBack') ?? 'Back'}
          >
            <ChevronLeft size={22} color="#fff" strokeWidth={2} />
          </HeaderIconButton>
        }
        right={<View style={{ width: 36 }} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={s.avatarRow}>
            <TouchableOpacity
              onPress={onPickAvatar}
              activeOpacity={0.7}
              disabled={isUploading}
              style={s.avatarTouchable}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={s.avatar} />
              ) : (
                <View style={[s.avatar, s.avatarFallback]}>
                  <Text style={s.avatarInitial}>{initialOf(user)}</Text>
                </View>
              )}
              <View style={s.cameraBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={16} color="#fff" strokeWidth={2} />
                )}
              </View>
            </TouchableOpacity>

            <Text style={s.avatarHint}>
              {isUploading
                ? (t('profileUploading') ?? 'Uploading…')
                : avatarChanged
                  ? (t('profileAvatarUpdated') ?? 'Photo updated ✓')
                  : (t('profileTapAvatar') ?? 'Tap to change avatar')}
            </Text>
          </View>

          {/* Display name */}
          <Text style={s.label}>{t('authDisplayName') ?? 'Display name'}</Text>
          <TextInput
            style={s.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('authDisplayName') ?? 'Display name'}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            selectionColor={colors.accent}
          />
          <View style={s.underline} />

          <View style={{ height: 20 }} />

          {/* Bio */}
          <Text style={s.label}>{t('profileBio') ?? 'Bio'}</Text>
          <TextInput
            style={[s.input, s.bio]}
            value={bio}
            onChangeText={setBio}
            placeholder={
              t('profileBioPlaceholder') ?? 'Tell us about yourself…'
            }
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            maxLength={1000}
            textAlignVertical="top"
            selectionColor={colors.accent}
          />
          <View style={s.underline} />
          <Text style={s.counter}>{bio.length} / 1000</Text>

          {!!error && <Text style={s.error}>{error}</Text>}

          <View style={{ height: 24 }} />

          <TouchableOpacity
            style={[s.btn, !canSave && s.btnDisabled]}
            onPress={canSave ? onSave : undefined}
            activeOpacity={canSave ? 0.85 : 1}
          >
            <Text style={s.btnText}>
              {isSaving ? '...' : (t('profileSave') ?? 'Save').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    avatarRow: { alignItems: 'center', marginBottom: 24 },
    avatarTouchable: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    avatarFallback: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight ?? '#eee',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontSize: 48,
      fontWeight: '300',
      color: colors.text,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarHint: {
      marginTop: 10,
      color: colors.textMuted,
      fontSize: fontSize.sm,
    },
    label: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginBottom: 6,
    },
    input: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
      paddingVertical: 8,
    },
    bio: { minHeight: 120, lineHeight: 22 },
    underline: {
      height: 1.5,
      backgroundColor: colors.borderLight ?? '#ccc',
    },
    counter: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: fontSize.xs,
      textAlign: 'right',
    },
    error: {
      color: colors.danger ?? '#C62828',
      fontSize: fontSize.sm,
      marginTop: 12,
      textAlign: 'center',
    },
    btn: {
      width: '100%',
      height: 54,
      backgroundColor: colors.accent,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    btnDisabled: { opacity: 0.4 },
    btnText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
  });