// src/components/UserModerationSheet.js
//
// A reusable bottom-sheet of moderation actions for a given user: Block and
// Report. Drops into any screen that knows a target userId (message thread,
// public profile). Handles its own confirm/reason flow and calls the API; the
// parent supplies the target and gets onBlocked / onReported callbacks.
//
// Usage:
//   const [modVisible, setModVisible] = useState(false);
//   ...
//   <UserModerationSheet
//     visible={modVisible}
//     onClose={() => setModVisible(false)}
//     userId={otherUserId}
//     userName={otherUserName}
//     conversationId={conversationId}   // optional
//     messageId={reportableMessageId}   // optional — enables "report this message"
//     onBlocked={() => { /* e.g. navigation.goBack() + invalidate lists */ }}
//     onReported={() => { /* e.g. toast */ }}
//   />

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Flag, Ban, X } from 'lucide-react-native';

import { useTheme } from '../theme/ThemeContext';
import { useT } from '../i18n';
import { blockUser, reportUser } from '../api/moderation';

const REASONS = ['spam', 'harassment', 'inappropriate', 'scam', 'impersonation', 'other'];

export default function UserModerationSheet({
  visible,
  onClose,
  userId,
  userName,
  conversationId = null,
  messageId = null,
  onBlocked,
  onReported,
}) {
  const { colors, fontSize, radius } = useTheme();
  const { t } = useT();
  const s = makeStyles({ colors, fontSize, radius });

  // 'menu' = action list; 'report' = reason picker; 'confirmBlock' = confirm.
  const [view, setView] = useState('menu');
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (busy) return;
    setView('menu');
    onClose?.();
  };

  const doBlock = async () => {
    setBusy(true);
    try {
      await blockUser(userId);
      setBusy(false);
      setView('menu');
      onClose?.();
      onBlocked?.();
    } catch (e) {
      setBusy(false);
      // Keep the sheet open; a parent toast/log can surface the error.
    }
  };

  const doReport = async (reason) => {
    setBusy(true);
    try {
      await reportUser({ userId, messageId, conversationId, reason });
      setBusy(false);
      setView('menu');
      onClose?.();
      onReported?.();
    } catch (e) {
      setBusy(false);
    }
  };

  const name = userName || (t('messagesUnknownUser') ?? 'this user');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={s.backdrop} onPress={close} />
      <View style={s.sheet}>
        <View style={s.grabber} />

        {view === 'menu' && (
          <>
            {/* Report this message (only when a messageId was supplied) */}
            {messageId ? (
              <Pressable style={s.row} onPress={() => setView('report')}>
                <Flag size={20} color={colors.text} strokeWidth={2} />
                <Text style={s.rowText}>{t('modReportMessage') ?? 'Report this message'}</Text>
              </Pressable>
            ) : null}

            {/* Report the user */}
            <Pressable style={s.row} onPress={() => setView('report')}>
              <Flag size={20} color={colors.text} strokeWidth={2} />
              <Text style={s.rowText}>{t('modReportUser') ?? 'Report user'}</Text>
            </Pressable>

            {/* Block the user */}
            <Pressable style={s.row} onPress={() => setView('confirmBlock')}>
              <Ban size={20} color={colors.danger ?? '#C62828'} strokeWidth={2} />
              <Text style={[s.rowText, { color: colors.danger ?? '#C62828' }]}>
                {t('modBlockUser') ?? 'Block user'}
              </Text>
            </Pressable>

            <Pressable style={[s.row, s.cancelRow]} onPress={close}>
              <X size={20} color={colors.textMuted} strokeWidth={2} />
              <Text style={[s.rowText, { color: colors.textMuted }]}>
                {t('cancel') ?? 'Cancel'}
              </Text>
            </Pressable>
          </>
        )}

        {view === 'report' && (
          <>
            <Text style={s.sheetTitle}>{t('modReportReasonTitle') ?? 'Why are you reporting?'}</Text>
            {REASONS.map((r) => (
              <Pressable
                key={r}
                style={s.row}
                disabled={busy}
                onPress={() => doReport(r)}
              >
                <Text style={s.rowText}>{t(`modReason_${r}`) ?? r}</Text>
              </Pressable>
            ))}
            {busy ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
            ) : (
              <Pressable style={[s.row, s.cancelRow]} onPress={() => setView('menu')}>
                <Text style={[s.rowText, { color: colors.textMuted }]}>
                  {t('back') ?? 'Back'}
                </Text>
              </Pressable>
            )}
          </>
        )}

        {view === 'confirmBlock' && (
          <>
            <Text style={s.sheetTitle}>{t('modBlockConfirmTitle') ?? 'Block user?'}</Text>
            <Text style={s.sheetBody}>
              {(t('modBlockConfirmBody') ?? 'You will no longer see messages from {name}, and they cannot message you.').replace('{name}', name)}
            </Text>
            <Pressable
              style={[s.confirmBtn, busy && { opacity: 0.6 }]}
              disabled={busy}
              onPress={doBlock}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.confirmText}>{t('modBlockUser') ?? 'Block user'}</Text>
              )}
            </Pressable>
            <Pressable style={[s.row, s.cancelRow]} onPress={() => setView('menu')} disabled={busy}>
              <Text style={[s.rowText, { color: colors.textMuted }]}>{t('cancel') ?? 'Cancel'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors, fontSize, radius }) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingBottom: 32,
      paddingTop: 8,
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderLight ?? '#ccc',
      marginVertical: 10,
    },
    sheetTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 8,
      paddingTop: 6,
      paddingBottom: 10,
    },
    sheetBody: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      paddingHorizontal: 8,
      paddingBottom: 16,
      lineHeight: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight ?? '#eee',
    },
    cancelRow: { borderBottomWidth: 0 },
    rowText: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
    confirmBtn: {
      backgroundColor: colors.danger ?? '#C62828',
      borderRadius: radius.md,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 4,
    },
    confirmText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
  });