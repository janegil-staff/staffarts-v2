// src/screens/newArtwork/NewArtworkScreen.js
//
// 4-step wizard to create an artwork:
//   1. Images   — add up to 6, first is the cover
//   2. Details  — title (required), description, medium, year, dimensions
//   3. Price    — price, currency, status
//   4. Review   — summary, then Publish
//
// Only the title is required to publish. Everything else is optional.

import { useState } from "react";
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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
} from "lucide-react-native";

import HeaderIconButton from "../../components/HeaderIconButton";
import { useTheme } from "../../theme/ThemeContext";
import { useT } from "../../i18n";
import { useArtworkImages } from "../../hooks/useArtworkImages";
import * as artworkApi from "../../api/artwork";

const STATUSES = ["available", "reserved", "sold"];
const CURRENCIES = ["NOK", "EUR", "USD", "GBP", "SEK", "DKK"];
const STEP_COUNT = 4;

export default function NewArtworkScreen({ route }) {
  const { colors, fontSize, radius, spacing } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // Edit mode: a full artwork object passed in route params. When present,
  // we prefill all fields, call PATCH instead of POST, and label the final
  // button "Save" instead of "Publish".
  const editing = route?.params?.artwork ?? null;
  const editingId = editing?._id ?? null;

  const initialImages = Array.isArray(editing?.images)
    ? editing.images
        .map((im) => (typeof im === "string" ? im : im?.url))
        .filter(Boolean)
    : [];

  const { images, addImage, removeImage, moveToCover, isUploading, maxImages } =
    useArtworkImages(initialImages);

  const [step, setStep] = useState(1);

  // Form state (prefilled from `editing` when in edit mode)
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [medium, setMedium] = useState(editing?.medium ?? "");
  const [year, setYear] = useState(editing?.year ? String(editing.year) : "");
  const [width, setWidth] = useState(
    editing?.dimensions?.width != null ? String(editing.dimensions.width) : "",
  );
  const [height, setHeight] = useState(
    editing?.dimensions?.height != null
      ? String(editing.dimensions.height)
      : "",
  );
  const [depth, setDepth] = useState(
    editing?.dimensions?.depth != null ? String(editing.dimensions.depth) : "",
  );
  const [showDepth, setShowDepth] = useState(
    editing?.dimensions?.depth != null && editing.dimensions.depth !== "",
  );
  const [unit, setUnit] = useState(editing?.dimensions?.unit ?? "cm");
  const [price, setPrice] = useState(
    editing?.price != null ? String(editing.price) : "",
  );
  const [currency, setCurrency] = useState(editing?.currency ?? "NOK");
  const [status, setStatus] = useState(editing?.status ?? "available");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const s = makeStyles({ colors, fontSize, radius, spacing });

  const titleValid = title.trim().length >= 1;

  const canAdvance = () => {
    if (step === 2) return titleValid; // title is gated at the details step
    return true;
  };

  const next = () => {
    setError("");
    if (step === 2 && !titleValid) {
      setError(t("artworkTitleRequired") ?? "A title is required");
      return;
    }
    setStep((p) => Math.min(p + 1, STEP_COUNT));
  };

  const back = () => {
    setError("");
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep((p) => Math.max(p - 1, 1));
    }
  };

  const publish = async () => {
    setError("");
    if (!titleValid) {
      setStep(2);
      setError(t("artworkTitleRequired") ?? "A title is required");
      return;
    }
    setIsSaving(true);
    try {
      const dims = {};
      if (width) dims.width = Number(width);
      if (height) dims.height = Number(height);
      if (showDepth && depth) dims.depth = Number(depth);
      if (unit) dims.unit = unit;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        medium: medium.trim(),
        year: year ? Number(year) : null,
        dimensions: dims,
        price: price ? Number(price) : null,
        currency,
        status,
        images,
      };

      const saved = editingId
        ? await artworkApi.updateArtwork(editingId, payload)
        : await artworkApi.createArtwork(payload);

      // Invalidate cached artwork queries so the Home feed, the artist's
      // own grid, and the detail view all refetch and reflect the change
      // immediately instead of waiting out the staleTime.
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      if (editingId) {
        queryClient.invalidateQueries({ queryKey: ["artwork", editingId] });
      }

      navigation.goBack();
      return saved;
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          (editingId
            ? (t("artworkSaveFailed") ?? "Could not save changes")
            : (t("artworkPublishFailed") ?? "Could not publish artwork")),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Custom header (modal close + step progress) */}
      <View style={[s.header, { paddingTop: spacing.lg + 24 }]}>
        <HeaderIconButton
          onPress={() => navigation.goBack()}
          accessibilityLabel={t("close") ?? "Close"}
        >
          <X size={22} color="#fff" strokeWidth={2} />
        </HeaderIconButton>
        <Text style={s.headerTitle}>
          {editingId
            ? (t("artworkEditTitle") ?? "Edit artwork")
            : (t("artworkNewTitle") ?? "New artwork")}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress dots */}
      <View style={s.progress}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor:
                  i + 1 <= step
                    ? colors.accent
                    : (colors.borderLight ?? "#ddd"),
                width: i + 1 === step ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && (
            <StepImages
              s={s}
              t={t}
              colors={colors}
              images={images}
              addImage={addImage}
              removeImage={removeImage}
              moveToCover={moveToCover}
              isUploading={isUploading}
              maxImages={maxImages}
            />
          )}

          {step === 2 && (
            <StepDetails
              s={s}
              t={t}
              colors={colors}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              medium={medium}
              setMedium={setMedium}
              year={year}
              setYear={setYear}
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
              depth={depth}
              setDepth={setDepth}
              showDepth={showDepth}
              setShowDepth={setShowDepth}
              unit={unit}
              setUnit={setUnit}
            />
          )}

          {step === 3 && (
            <StepPrice
              s={s}
              t={t}
              colors={colors}
              price={price}
              setPrice={setPrice}
              currency={currency}
              setCurrency={setCurrency}
              status={status}
              setStatus={setStatus}
            />
          )}

          {step === 4 && (
            <StepReview
              s={s}
              t={t}
              images={images}
              title={title}
              description={description}
              medium={medium}
              year={year}
              width={width}
              height={height}
              depth={showDepth ? depth : ""}
              unit={unit}
              price={price}
              currency={currency}
              status={status}
            />
          )}

          {!!error && <Text style={s.error}>{error}</Text>}
        </ScrollView>

        {/* Footer nav — paddingBottom includes the device safe-area inset so
            the Next/Back buttons clear the iOS gesture bar / Android nav bar. */}
        <View style={[s.footer, { paddingBottom: 16 + insets.bottom }]}>
          <Pressable
            onPress={back}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          >
            <ChevronLeft size={18} color={colors.text} strokeWidth={2} />
            <Text style={s.backText}>
              {step === 1 ? (t("cancel") ?? "Cancel") : (t("back") ?? "Back")}
            </Text>
          </Pressable>

          {step < STEP_COUNT ? (
            <Pressable
              onPress={next}
              style={({ pressed }) => [
                s.nextBtn,
                !canAdvance() && s.nextBtnDisabled,
                pressed && canAdvance() && { opacity: 0.85 },
              ]}
            >
              <Text style={s.nextText}>{t("next") ?? "Next"}</Text>
              <ChevronRight size={18} color="#fff" strokeWidth={2} />
            </Pressable>
          ) : (
            <Pressable
              onPress={isSaving ? undefined : publish}
              style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.nextText}>
                  {(editingId
                    ? (t("artworkSave") ?? "Save")
                    : (t("artworkPublish") ?? "Publish")
                  ).toUpperCase()}
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Step 1: Images ─────────────────────────────────────────────────────────

function StepImages({
  s,
  t,
  colors,
  images,
  addImage,
  removeImage,
  moveToCover,
  isUploading,
  maxImages,
}) {
  // Compute a fixed square size for the 3-column grid. Using a fixed pixel
  // size (rather than width:'30%' + aspectRatio) guarantees true squares —
  // aspectRatio on percentage widths collapses in flex-wrap layouts.
  const { width: screenWidth } = useWindowDimensions();
  const GRID_PADDING = 24; // ScrollView contentContainer padding
  const GAP = 12;
  const COLS = 3;
  const cellSize = Math.floor(
    (screenWidth - GRID_PADDING * 2 - GAP * (COLS - 1)) / COLS,
  );
  const square = { width: cellSize, height: cellSize };

  return (
    <View>
      <Text style={s.stepTitle}>{t("artworkStepImages") ?? "Images"}</Text>
      <Text style={s.stepHint}>
        {t("artworkImagesHint") ??
          `Add up to ${maxImages} images. The first one is the cover.`}
      </Text>

      <View style={s.imageGrid}>
        {images.map((uri, i) => (
          <View key={uri} style={[s.imageCell, square]}>
            <Image source={{ uri }} style={s.imageThumb} />
            {i === 0 && (
              <View style={s.coverBadge}>
                <Star size={12} color="#fff" fill="#fff" />
                <Text style={s.coverText}>{t("artworkCover") ?? "Cover"}</Text>
              </View>
            )}
            <View style={s.imageActions}>
              {i !== 0 && (
                <Pressable
                  onPress={() => moveToCover(i)}
                  style={s.imageActionBtn}
                  hitSlop={6}
                >
                  <Star size={14} color="#fff" />
                </Pressable>
              )}
              <Pressable
                onPress={() => removeImage(i)}
                style={s.imageActionBtn}
                hitSlop={6}
              >
                <Trash2 size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        ))}

        {images.length < maxImages && (
          <Pressable
            onPress={addImage}
            disabled={isUploading}
            style={({ pressed }) => [
              s.addCell,
              square,
              pressed && { opacity: 0.6 },
            ]}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Plus size={28} color={colors.accent} strokeWidth={2} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── Step 2: Details ──────────────────────────────────────────────────────

function StepDetails({
  s,
  t,
  colors,
  title,
  setTitle,
  description,
  setDescription,
  medium,
  setMedium,
  year,
  setYear,
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  showDepth,
  setShowDepth,
  unit,
  setUnit,
}) {
  return (
    <View>
      <Text style={s.stepTitle}>{t("artworkStepDetails") ?? "Details"}</Text>

      <Field
        s={s}
        colors={colors}
        label={`${t("artworkTitle") ?? "Title"}*`}
        value={title}
        onChangeText={setTitle}
        placeholder={t("artworkTitlePlaceholder") ?? "Untitled"}
      />

      <Field
        s={s}
        colors={colors}
        label={t("artworkDescription") ?? "Description"}
        value={description}
        onChangeText={setDescription}
        placeholder={t("artworkDescriptionPlaceholder") ?? "About this piece…"}
        multiline
      />

      <Field
        s={s}
        colors={colors}
        label={t("artworkMedium") ?? "Medium"}
        value={medium}
        onChangeText={setMedium}
        placeholder={
          t("artworkMediumPlaceholder") ?? "Oil on canvas, mixed media…"
        }
      />

      <Field
        s={s}
        colors={colors}
        label={t("artworkYear") ?? "Year"}
        value={year}
        onChangeText={setYear}
        placeholder="2026"
        keyboardType="number-pad"
      />

      <Text style={[s.fieldLabel, { marginTop: 8 }]}>
        {t("artworkDimensions") ?? "Dimensions"}
      </Text>
      <View style={s.dimRow}>
        <DimInput
          s={s}
          colors={colors}
          value={width}
          onChangeText={setWidth}
          placeholder={t("artworkWidth") ?? "W"}
        />
        <Text style={s.dimX}>×</Text>
        <DimInput
          s={s}
          colors={colors}
          value={height}
          onChangeText={setHeight}
          placeholder={t("artworkHeight") ?? "H"}
        />
        {showDepth && (
          <>
            <Text style={s.dimX}>×</Text>
            <DimInput
              s={s}
              colors={colors}
              value={depth}
              onChangeText={setDepth}
              placeholder={t("artworkDepth") ?? "D"}
            />
          </>
        )}
      </View>

      {/* Depth toggle */}
      <Pressable
        onPress={() => {
          if (showDepth) setDepth(""); // clear depth when hiding
          setShowDepth(!showDepth);
        }}
        style={({ pressed }) => [s.depthToggle, pressed && { opacity: 0.6 }]}
        hitSlop={6}
      >
        <Text style={[s.depthToggleText, { color: colors.accent }]}>
          {showDepth
            ? (t("artworkRemoveDepth") ?? "− Remove depth")
            : (t("artworkAddDepth") ?? "+ Add depth (for 3D work)")}
        </Text>
      </Pressable>

      <View style={s.unitRow}>
        {["cm", "in"].map((u) => (
          <Pressable
            key={u}
            onPress={() => setUnit(u)}
            style={[
              s.unitChip,
              unit === u && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
          >
            <Text style={[s.unitChipText, unit === u && { color: "#fff" }]}>
              {u}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Step 3: Price & status ─────────────────────────────────────────────────

function StepPrice({
  s,
  t,
  colors,
  price,
  setPrice,
  currency,
  setCurrency,
  status,
  setStatus,
}) {
  return (
    <View>
      <Text style={s.stepTitle}>
        {t("artworkStepPrice") ?? "Price & status"}
      </Text>

      <Field
        s={s}
        colors={colors}
        label={t("artworkPrice") ?? "Price"}
        value={price}
        onChangeText={setPrice}
        placeholder="0"
        keyboardType="decimal-pad"
      />

      <Text style={[s.fieldLabel, { marginTop: 8 }]}>
        {t("artworkCurrency") ?? "Currency"}
      </Text>
      <View style={s.chipRow}>
        {CURRENCIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCurrency(c)}
            style={[
              s.chip,
              currency === c && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
          >
            <Text style={[s.chipText, currency === c && { color: "#fff" }]}>
              {c}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[s.fieldLabel, { marginTop: 24 }]}>
        {t("artworkStatus") ?? "Status"}
      </Text>
      <View style={s.chipRow}>
        {STATUSES.map((st) => (
          <Pressable
            key={st}
            onPress={() => setStatus(st)}
            style={[
              s.chip,
              status === st && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
          >
            <Text style={[s.chipText, status === st && { color: "#fff" }]}>
              {t(`artworkStatus_${st}`) ?? st}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Step 4: Review ─────────────────────────────────────────────────────────

function StepReview({
  s,
  t,
  images,
  title,
  description,
  medium,
  year,
  width,
  height,
  depth,
  unit,
  price,
  currency,
  status,
}) {
  const dimsStr = [width, height, depth].filter(Boolean).join(" × ");
  return (
    <View>
      <Text style={s.stepTitle}>{t("artworkStepReview") ?? "Review"}</Text>

      {images[0] ? (
        <Image source={{ uri: images[0] }} style={s.reviewCover} />
      ) : (
        <View style={[s.reviewCover, s.reviewCoverEmpty]}>
          <Text style={s.reviewCoverEmptyText}>
            {t("artworkNoImages") ?? "No images"}
          </Text>
        </View>
      )}

      <ReviewRow
        s={s}
        label={t("artworkTitle") ?? "Title"}
        value={title || "—"}
      />
      {!!description && (
        <ReviewRow
          s={s}
          label={t("artworkDescription") ?? "Description"}
          value={description}
        />
      )}
      {!!medium && (
        <ReviewRow
          s={s}
          label={t("artworkMedium") ?? "Medium"}
          value={medium}
        />
      )}
      {!!year && (
        <ReviewRow s={s} label={t("artworkYear") ?? "Year"} value={year} />
      )}
      {!!dimsStr && (
        <ReviewRow
          s={s}
          label={t("artworkDimensions") ?? "Dimensions"}
          value={`${dimsStr} ${unit}`}
        />
      )}
      {!!price && (
        <ReviewRow
          s={s}
          label={t("artworkPrice") ?? "Price"}
          value={`${price} ${currency}`}
        />
      )}
      <ReviewRow
        s={s}
        label={t("artworkStatus") ?? "Status"}
        value={t(`artworkStatus_${status}`) ?? status}
      />
      <ReviewRow
        s={s}
        label={t("artworkImages") ?? "Images"}
        value={String(images.length)}
      />
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

// ── Shared field components ─────────────────────────────────────────────────

function Field({
  s,
  colors,
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.input, multiline && s.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={'#D8D4CE'}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        selectionColor={colors.accent}
      />
      <View style={s.underline} />
    </View>
  );
}

function DimInput({ s, colors, value, onChangeText, placeholder }) {
  return (
    <TextInput
      style={s.dimInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={'#D8D4CE'}
      keyboardType="decimal-pad"
      selectionColor={colors.accent}
    />
  );
}

const makeStyles = ({ colors, fontSize, radius, spacing }) =>
  StyleSheet.create({
    header: {
      backgroundColor: "#2D4A6E",
      paddingHorizontal: spacing.lg,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      color: "#fff",
      fontSize: fontSize.lg,
      fontWeight: "500",
    },
    progress: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 16,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    stepTitle: {
      fontSize: fontSize.xl,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    stepHint: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      marginBottom: 20,
      lineHeight: 20,
    },
    // Images
    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    imageCell: {
      borderRadius: radius.md,
      overflow: "hidden",
      position: "relative",
    },
    imageThumb: { width: "100%", height: "100%" },
    coverBadge: {
      position: "absolute",
      top: 6,
      left: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    coverText: { color: "#fff", fontSize: 10, fontWeight: "700" },
    imageActions: {
      position: "absolute",
      bottom: 6,
      right: 6,
      flexDirection: "row",
      gap: 6,
    },
    imageActionBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    addCell: {
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    // Fields
    fieldLabel: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      fontWeight: "600",
      marginBottom: 6,
    },
    input: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "500",
      paddingVertical: 8,
    },
    inputMultiline: { minHeight: 90 },
    underline: {
      height: 1.5,
      backgroundColor: colors.borderLight ?? "#ccc",
    },
    dimRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dimInput: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.md,
      paddingVertical: 8,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.borderLight ?? "#ccc",
      textAlign: "center",
    },
    dimX: { color: colors.textMuted, fontSize: fontSize.md },
    depthToggle: {
      marginTop: 12,
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    depthToggleText: {
      fontSize: fontSize.sm,
      fontWeight: "600",
    },
    unitRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    unitChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? "#ccc",
    },
    unitChipText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: fontSize.sm,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.borderLight ?? "#ccc",
    },
    chipText: { color: colors.text, fontWeight: "600", fontSize: fontSize.sm },
    // Review
    reviewCover: {
      width: "100%",
      height: 200,
      borderRadius: radius.md,
      marginBottom: 16,
    },
    reviewCoverEmpty: {
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    reviewCoverEmptyText: { color: colors.textMuted, fontSize: fontSize.sm },
    reviewRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight ?? "#eee",
      gap: 16,
    },
    reviewLabel: { color: colors.textMuted, fontSize: fontSize.sm },
    reviewValue: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: "500",
      flex: 1,
      textAlign: "right",
    },
    error: {
      color: colors.danger ?? "#C62828",
      fontSize: fontSize.sm,
      marginTop: 16,
      textAlign: "center",
    },
    // Footer
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight ?? "#eee",
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    backText: { color: colors.text, fontSize: fontSize.md, fontWeight: "600" },
    nextBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      minWidth: 120,
      justifyContent: "center",
    },
    nextBtnDisabled: { opacity: 0.4 },
    nextText: {
      color: "#fff",
      fontSize: fontSize.md,
      fontWeight: "800",
      letterSpacing: 1,
    },
  });