// src/screens/newEvent/NewEventScreen.js
//
// Create / edit an event. 4-step wizard mirroring the artwork wizard:
//   1. Cover    — single cover image (optional)
//   2. Details  — title (required), category, description
//   3. When/Where — date + time, location, free toggle
//   4. Review   — summary, then Publish / Save
//
// Edit mode: pass route.params.event to prefill, PATCH instead of POST.

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, ImagePlus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react-native';

import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';
import { useEventCover } from '../../hooks/useEventCover';
import * as eventApi from '../../api/event';

const CATEGORIES = [
  'opening',
  'exhibition',
  'workshop',
  'talk',
  'fair',
  'concert',
  'performance',
  'other',
];
const STEP_COUNT = 4;
const CURRENCIES = ['NOK', 'EUR', 'USD', 'GBP', 'SEK', 'DKK'];

export default function NewEventScreen({ route }) {
  const { colors, fontSize, radius, spacing } = useTheme();
  const { t, lang } = useT();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const editing = route?.params?.event ?? null;
  const editingId = editing?._id ?? null;

  const { coverImage, pickAndUpload, clearCover, isUploading } = useEventCover(
    editing?.coverImage ?? '',
  );

  const [step, setStep] = useState(1);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [category, setCategory] = useState(editing?.category ?? 'other');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [date, setDate] = useState(
    editing?.date ? new Date(editing.date) : new Date(Date.now() + 3600_000),
  );
  const [location, setLocation] = useState(editing?.location ?? '');
  const [isFree, setIsFree] = useState(!!editing?.isFree);
  const [ticketPrice, setTicketPrice] = useState(
    editing?.ticketPrice != null ? String(editing.ticketPrice) : '',
  );
  const [currency, setCurrency] = useState(editing?.currency ?? 'NOK');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const s = makeStyles({ colors, fontSize, radius, spacing });
  const titleValid = title.trim().length >= 1;

  const next = () => {
    setError('');
    if (step === 2 && !titleValid) {
      setError(t('eventTitleRequired') ?? 'A title is required');
      return;
    }
    setStep((p) => Math.min(p + 1, STEP_COUNT));
  };
  const back = () => {
    setError('');
    if (step === 1) navigation.goBack();
    else setStep((p) => Math.max(p - 1, 1));
  };

  const publish = async () => {
    setError('');
    if (!titleValid) {
      setStep(2);
      setError(t('eventTitleRequired') ?? 'A title is required');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        date: date.toISOString(),
        location: location.trim(),
        coverImage,
        isFree,
        ticketPrice: isFree || !ticketPrice ? null : Number(ticketPrice),
        currency,
      };
      const saved = editingId
        ? await eventApi.updateEvent(editingId, payload)
        : await eventApi.createEvent(payload);

      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (editingId) {
        queryClient.invalidateQueries({ queryKey: ['event', editingId] });
      }
      navigation.goBack();
      return saved;
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          (editingId
            ? (t('eventSaveFailed') ?? 'Could not save changes')
            : (t('eventPublishFailed') ?? 'Could not publish event')),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const dateStr = date.toLocaleDateString(lang || undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(lang || undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[s.header, { paddingTop: spacing.lg + 24 }]}>
        <HeaderIconButton onPress={() => navigation.goBack()} accessibilityLabel={t('close') ?? 'Close'}>
          <X size={22} color="#fff" strokeWidth={2} />
        </HeaderIconButton>
        <Text style={s.headerTitle}>
          {editingId ? (t('eventEditTitle') ?? 'Edit event') : (t('eventNewTitle') ?? 'New event')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.progress}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: i + 1 <= step ? colors.accent : (colors.borderLight ?? '#ddd'),
                width: i + 1 === step ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Step 1 — Cover */}
          {step === 1 && (
            <View>
              <Text style={s.stepTitle}>{t('eventStepCover') ?? 'Cover image'}</Text>
              <Text style={s.stepHint}>{t('eventCoverHint') ?? 'Add a cover image (optional).'}</Text>
              {coverImage ? (
                <View style={s.coverWrap}>
                  <Image source={{ uri: coverImage }} style={s.coverImg} />
                  <Pressable onPress={clearCover} style={s.coverRemove} hitSlop={6}>
                    <Trash2 size={16} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickAndUpload}
                  disabled={isUploading}
                  style={({ pressed }) => [s.coverAdd, pressed && { opacity: 0.6 }]}
                >
                  {isUploading ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <>
                      <ImagePlus size={32} color={colors.accent} strokeWidth={2} />
                      <Text style={s.coverAddText}>{t('eventAddCover') ?? 'Add cover'}</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <View>
              <Text style={s.stepTitle}>{t('eventStepDetails') ?? 'Details'}</Text>

              <Text style={s.fieldLabel}>{`${t('eventTitle') ?? 'Title'}*`}</Text>
              <TextInput
                style={s.input}
                value={title}
                onChangeText={setTitle}
                placeholder={t('eventTitlePlaceholder') ?? 'Spring group show'}
               placeholderTextColor="#C4BFB8"
                selectionColor={colors.accent}
              />
              <View style={s.underline} />

              <Text style={[s.fieldLabel, { marginTop: 18 }]}>{t('eventCategory') ?? 'Category'}</Text>
              <View style={s.chipRow}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[s.chip, category === c && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  >
                    <Text style={[s.chipText, category === c && { color: '#fff' }]}>
                      {t(`eventCat_${c}`) ?? c}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[s.fieldLabel, { marginTop: 18 }]}>{t('eventDescription') ?? 'Description'}</Text>
              <TextInput
                style={[s.input, s.inputMultiline]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('eventDescriptionPlaceholder') ?? 'What’s happening…'}
                placeholderTextColor="#C4BFB8"
                multiline
                textAlignVertical="top"
                selectionColor={colors.accent}
              />
              <View style={s.underline} />
            </View>
          )}

          {/* Step 3 — When / Where */}
          {step === 3 && (
            <View>
              <Text style={s.stepTitle}>{t('eventStepWhen') ?? 'When & where'}</Text>

              <Text style={s.fieldLabel}>{t('eventDate') ?? 'Date'}</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={s.pickerRow}>
                <Text style={s.pickerValue}>{dateStr}</Text>
              </Pressable>

              <Text style={[s.fieldLabel, { marginTop: 18 }]}>{t('eventTime') ?? 'Time'}</Text>
              <Pressable onPress={() => setShowTimePicker(true)} style={s.pickerRow}>
                <Text style={s.pickerValue}>{timeStr}</Text>
              </Pressable>

              {/* iOS: pickers live in a dismissable bottom-sheet modal so they
                  never sprawl across the screen. Android: native dialog. */}
              {Platform.OS === 'ios' ? (
                <>
                  <PickerModal
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    doneLabel={t('done') ?? 'Done'}
                    colors={colors}
                    s={s}
                  >
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="spinner"
                      themeVariant={colors.isDark ? 'dark' : 'light'}
                      onChange={(e, selected) => {
                        if (selected) {
                          const d = new Date(date);
                          d.setFullYear(
                            selected.getFullYear(),
                            selected.getMonth(),
                            selected.getDate(),
                          );
                          setDate(d);
                        }
                      }}
                    />
                  </PickerModal>

                  <PickerModal
                    visible={showTimePicker}
                    onClose={() => setShowTimePicker(false)}
                    doneLabel={t('done') ?? 'Done'}
                    colors={colors}
                    s={s}
                  >
                    <DateTimePicker
                      value={date}
                      mode="time"
                      display="spinner"
                      themeVariant={colors.isDark ? 'dark' : 'light'}
                      onChange={(e, selected) => {
                        if (selected) {
                          const d = new Date(date);
                          d.setHours(selected.getHours(), selected.getMinutes());
                          setDate(d);
                        }
                      }}
                    />
                  </PickerModal>
                </>
              ) : (
                <>
                  {showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="default"
                      onChange={(e, selected) => {
                        setShowDatePicker(false);
                        if (selected) {
                          const d = new Date(date);
                          d.setFullYear(
                            selected.getFullYear(),
                            selected.getMonth(),
                            selected.getDate(),
                          );
                          setDate(d);
                        }
                      }}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={date}
                      mode="time"
                      display="default"
                      onChange={(e, selected) => {
                        setShowTimePicker(false);
                        if (selected) {
                          const d = new Date(date);
                          d.setHours(selected.getHours(), selected.getMinutes());
                          setDate(d);
                        }
                      }}
                    />
                  )}
                </>
              )}

              <Text style={[s.fieldLabel, { marginTop: 18 }]}>{t('eventLocation') ?? 'Location'}</Text>
              <TextInput
                style={s.input}
                value={location}
                onChangeText={setLocation}
                placeholder={t('eventLocationPlaceholder') ?? 'Venue, city'}
                placeholderTextColor="#C4BFB8"
                selectionColor={colors.accent}
              />
              <View style={s.underline} />

              <View style={s.freeRow}>
                <Text style={s.freeLabel}>{t('eventFree') ?? 'Free entry'}</Text>
                <Switch
                  value={isFree}
                  onValueChange={setIsFree}
                  trackColor={{ true: colors.accent }}
                />
              </View>

              {/* Ticket price — only when the event isn't free */}
              {!isFree && (
                <View style={{ marginTop: 18 }}>
                  <Text style={s.fieldLabel}>{t('eventTicketPrice') ?? 'Ticket price'}</Text>
                  <TextInput
                    style={s.input}
                    value={ticketPrice}
                    onChangeText={setTicketPrice}
                    placeholder="0"
                    placeholderTextColor="#C4BFB8"
                    keyboardType="decimal-pad"
                    selectionColor={colors.accent}
                  />
                  <View style={s.underline} />

                  <Text style={[s.fieldLabel, { marginTop: 14 }]}>{t('eventCurrency') ?? 'Currency'}</Text>
                  <View style={s.chipRow}>
                    {CURRENCIES.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setCurrency(c)}
                        style={[s.chip, currency === c && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                      >
                        <Text style={[s.chipText, currency === c && { color: '#fff' }]}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <View>
              <Text style={s.stepTitle}>{t('eventStepReview') ?? 'Review'}</Text>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={s.reviewCover} />
              ) : (
                <View style={[s.reviewCover, s.reviewCoverEmpty]}>
                  <Text style={s.reviewCoverEmptyText}>{t('eventNoCover') ?? 'No cover image'}</Text>
                </View>
              )}
              <ReviewRow s={s} label={t('eventTitle') ?? 'Title'} value={title || '—'} />
              <ReviewRow s={s} label={t('eventCategory') ?? 'Category'} value={t(`eventCat_${category}`) ?? category} />
              <ReviewRow s={s} label={t('eventDate') ?? 'Date'} value={`${dateStr} · ${timeStr}`} />
              {!!location && <ReviewRow s={s} label={t('eventLocation') ?? 'Location'} value={location} />}
              <ReviewRow s={s} label={t('eventFree') ?? 'Free entry'} value={isFree ? (t('yes') ?? 'Yes') : (t('no') ?? 'No')} />
              {!isFree && !!ticketPrice && (
                <ReviewRow
                  s={s}
                  label={t('eventTicketPrice') ?? 'Ticket price'}
                  value={`${ticketPrice} ${currency}`}
                />
              )}
              {!!description && <ReviewRow s={s} label={t('eventDescription') ?? 'Description'} value={description} />}
            </View>
          )}

          {!!error && <Text style={s.error}>{error}</Text>}
        </ScrollView>

        <View style={s.footer}>
          <Pressable onPress={back} style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}>
            <ChevronLeft size={18} color={colors.text} strokeWidth={2} />
            <Text style={s.backText}>{step === 1 ? (t('cancel') ?? 'Cancel') : (t('back') ?? 'Back')}</Text>
          </Pressable>

          {step < STEP_COUNT ? (
            <Pressable onPress={next} style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}>
              <Text style={s.nextText}>{t('next') ?? 'Next'}</Text>
              <ChevronRight size={18} color="#fff" strokeWidth={2} />
            </Pressable>
          ) : (
            <Pressable onPress={isSaving ? undefined : publish} style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.nextText}>
                  {(editingId ? (t('eventSave') ?? 'Save') : (t('eventPublish') ?? 'Publish')).toUpperCase()}
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ReviewRow({ s, label, value }) {
  return (
    <View style={s.reviewRow}>
      <Text style={s.reviewLabel}>{label}</Text>
      <Text style={s.reviewValue}>{value}</Text>
    </View>
  );
}

// Bottom-sheet wrapper for iOS date/time pickers — gives a tappable backdrop
// and a "Done" button so the picker is always dismissable.
function PickerModal({ visible, onClose, doneLabel, colors, s, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.modalBackdrop} onPress={onClose} />
      <View style={s.modalSheet}>
        <View style={s.modalBar}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={s.modalDone}>{doneLabel}</Text>
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors, fontSize, radius, spacing }) =>
  StyleSheet.create({
    header: {
      backgroundColor: '#2D4A6E',
      paddingHorizontal: spacing.lg,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: { color: '#fff', fontSize: fontSize.lg, fontWeight: '500' },
    progress: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 16 },
    dot: { height: 8, borderRadius: 4 },
    stepTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: 8 },
    stepHint: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
    coverWrap: { position: 'relative', borderRadius: radius.md, overflow: 'hidden' },
    coverImg: { width: '100%', height: 200 },
    coverRemove: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverAdd: {
      height: 200,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    coverAddText: { color: colors.accent, fontWeight: '600', fontSize: fontSize.sm },
    fieldLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginBottom: 6 },
    input: { color: colors.text, fontSize: fontSize.md, fontWeight: '500', paddingVertical: 8 },
    inputMultiline: { minHeight: 90 },
    underline: { height: 1.5, backgroundColor: colors.borderLight ?? '#ccc' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? '#ccc',
    },
    chipText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
    pickerRow: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    pickerValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 24,
    },
    modalBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight ?? '#eee',
    },
    modalDone: {
      color: colors.accent,
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    freeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    freeLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
    reviewCover: { width: '100%', height: 180, borderRadius: radius.md, marginBottom: 16 },
    reviewCoverEmpty: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    reviewCoverEmptyText: { color: colors.textMuted, fontSize: fontSize.sm },
    reviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight ?? '#eee',
      gap: 16,
    },
    reviewLabel: { color: colors.textMuted, fontSize: fontSize.sm },
    reviewValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '500', flex: 1, textAlign: 'right' },
    error: { color: colors.danger ?? '#C62828', fontSize: fontSize.sm, marginTop: 16, textAlign: 'center' },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight ?? '#eee',
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 8 },
    backText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
    nextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      minWidth: 120,
      justifyContent: 'center',
    },
    nextText: { color: '#fff', fontSize: fontSize.md, fontWeight: '800', letterSpacing: 1 },
  });