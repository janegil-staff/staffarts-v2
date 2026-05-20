// src/screens/settings/DeleteAccountScreen.js
//
// Dedicated screen for confirming account deletion. User enters their PIN,
// taps Delete, and we hard-delete the account (and all owned content) on
// the server, then sign out and reset to Tabs.

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { ChevronLeft, AlertTriangle } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import PinInput from '../../components/PinInput';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { tokenStorage } from '../../api/client';
import client from '../../api/client';

const DANGER = '#dc2626';

export default function DeleteAccountScreen() {
  const { colors, fontSize, radius } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = pin.length === 4 && !isSubmitting;

  const performDelete = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await client.delete('/api/auth/account', {
        data: { pin },
      });
      const removed = res.data?.data?.removed;

      // Sign out locally — clear tokens + auth store, then reset to Tabs.
      await tokenStorage.clearTokens();
      await signOut();

      const summary = removed
        ? `${removed.artworks ?? 0} ${t('deleteAccountArtworks') ?? 'artworks'}, ${removed.events ?? 0} ${t('deleteAccountEvents') ?? 'events'}, ${removed.exhibitions ?? 0} ${t('deleteAccountExhibitions') ?? 'exhibitions'}, ${removed.tracks ?? 0} ${t('deleteAccountTracks') ?? 'tracks'}, ${removed.messages ?? 0} ${t('deleteAccountMessages') ?? 'messages'}`
        : '';

      Alert.alert(
        t('deleteAccountDoneTitle') ?? 'Account deleted',
        (t('deleteAccountDoneMsg') ?? 'Your account and all associated content have been removed.') +
          (summary ? `\n\n${summary}` : ''),
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Tabs' }],
                }),
              );
            },
          },
        ],
      );
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          (t('deleteAccountFailed') ?? 'Could not delete account'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPressDelete = () => {
    if (!canSubmit) return;
    Alert.alert(
      t('deleteAccountConfirmTitle') ?? 'Delete account?',
      t('deleteAccountConfirmMsg') ??
        'This permanently removes your account, all your artworks, events, exhibitions, tracks, and messages. This cannot be undone.',
      [
        { text: t('cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('deleteAccountConfirmDelete') ?? 'Delete',
          style: 'destructive',
          onPress: performDelete,
        },
      ],
    );
  };

  const s = makeStyles({ colors, fontSize, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('deleteAccountTitle') ?? 'Delete account'}
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
          {/* Warning block */}
          <View style={s.warnBox}>
            <AlertTriangle size={32} color={DANGER} strokeWidth={2} />
            <Text style={s.warnTitle}>
              {t('deleteAccountWarnTitle') ?? 'This cannot be undone'}
            </Text>
            <Text style={s.warnBody}>
              {t('deleteAccountWarnBody') ??
                'Deleting your account will permanently remove:'}
            </Text>
            <Text style={s.warnBullets}>
              {'• ' + (t('deleteAccountWarnUser') ?? 'Your account and profile')}
              {'\n'}
              {'• ' + (t('deleteAccountWarnArtworks') ?? 'All artworks you have listed')}
              {'\n'}
              {'• ' + (t('deleteAccountWarnEvents') ?? 'All events and exhibitions you created')}
              {'\n'}
              {'• ' + (t('deleteAccountWarnTracks') ?? 'All tracks you have uploaded')}
              {'\n'}
              {'• ' + (t('deleteAccountWarnMessages') ?? 'All messages and conversations')}
            </Text>
          </View>

          <View style={{ height: 24 }} />

          <Text style={s.currentLabel}>
            {t('deleteAccountUser') ?? 'Account'}
          </Text>
          <Text style={s.currentValue}>{user?.email ?? '—'}</Text>

          <View style={{ height: 24 }} />

          <Text style={s.label}>
            {t('deleteAccountConfirmPin') ?? 'Confirm with your PIN to delete'}
          </Text>
          <View style={{ marginTop: 8 }}>
            <PinInput
              value={pin}
              onChange={setPin}
              editable={!isSubmitting}
              hasError={!!error}
            />
          </View>

          {!!error && <Text style={s.error}>{error}</Text>}

          <View style={{ height: 32 }} />

          <TouchableOpacity
            style={[s.btn, !canSubmit && s.btnDisabled]}
            onPress={canSubmit ? onPressDelete : undefined}
            activeOpacity={canSubmit ? 0.85 : 1}
          >
            <Text style={s.btnText}>
              {isSubmitting
                ? '...'
                : (t('deleteAccountButton') ?? 'Delete account').toUpperCase()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
              {t('cancel') ?? 'Cancel'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    warnBox: {
      padding: 18,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: DANGER,
      backgroundColor: `${DANGER}10`,
      alignItems: 'center',
    },
    warnTitle: {
      color: DANGER,
      fontSize: fontSize.lg,
      fontWeight: '700',
      marginTop: 8,
      textAlign: 'center',
    },
    warnBody: {
      color: colors.text,
      fontSize: fontSize.sm,
      marginTop: 8,
      textAlign: 'center',
    },
    warnBullets: {
      color: colors.text,
      fontSize: fontSize.sm,
      marginTop: 12,
      lineHeight: 22,
      alignSelf: 'stretch',
    },
    currentLabel: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginBottom: 4,
    },
    currentValue: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '500',
    },
    label: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: '600',
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
      backgroundColor: DANGER,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: DANGER,
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