// src/screens/about/AboutAppScreen.js
//
// The logged-out "front door" — shown when an anonymous user taps the 4th
// tab (which reads "About" + info icon while logged out). Tells the Staff
// Arts story and offers sign-in / create-account CTAs at the bottom.
//
// NOTE: the tribute story copy below is a placeholder. Replace the text in
// the `aboutAppStory` translation key (patch_translations_about_app.cjs)
// with the real story of your mother, "Staff".

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';

import Header from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

export default function AboutAppScreen() {
  const { colors, fontSize, spacing, radius } = useTheme();
  const { t } = useT();

  const s = makeStyles({ colors, fontSize, spacing, radius });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('aboutAppTab') ?? 'About'} />

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image
            source={require('../../../assets/focus_logo.png')}
            style={s.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={s.appName}>{t('appName') ?? 'Staff Arts'}</Text>
        <Text style={s.tagline}>
          {t('aboutAppTagline') ?? 'A home for art, artists, and collectors.'}
        </Text>

        {/* What the app is */}
        <Text style={s.sectionTitle}>
          {t('aboutAppWhatTitle') ?? 'What is Staff Arts?'}
        </Text>
        <Text style={s.body}>
          {t('aboutAppWhat') ??
            'Staff Arts is a marketplace and meeting place for original art. Discover artworks, follow artists, explore exhibitions and events, and connect directly with the people behind the work.'}
        </Text>

        {/* The Staff story */}
        <Text style={s.sectionTitle}>
          {t('aboutAppStoryTitle') ?? 'The story behind the name'}
        </Text>
        <Text style={s.body}>
          {t('aboutAppStory') ??
            'Staff Arts is named in tribute to “Staff” — a mixed-media artist whose work blends materials, textures, and feeling into something wholly her own. This app was built as a love letter to that spirit: a place where art made with heart can find the people who will treasure it. We hope it becomes a home for many artists like her.'}
        </Text>

        {/* Footer */}
        <Text style={s.footer}>
          {t('aboutAppFooter') ?? 'Qup DA · staffarts.com'}
        </Text>
      </ScrollView>
    </View>
  );
}

function makeStyles({ colors, fontSize, spacing, radius }) {
  return StyleSheet.create({
    scroll: {
      padding: spacing.lg,
      paddingBottom: 100,
      alignItems: 'center',
    },
    logoWrap: {
      width: 96,
      height: 96,
      borderRadius: 22,
      overflow: 'hidden',
      marginTop: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    logo: { width: 96, height: 96 },
    appName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    tagline: {
      marginTop: 6,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    sectionTitle: {
      alignSelf: 'stretch',
      marginTop: 28,
      marginBottom: 8,
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    body: {
      alignSelf: 'stretch',
      fontSize: fontSize.sm,
      color: colors.text,
      lineHeight: 22,
    },
    primaryBtn: {
      width: '100%',
      height: 54,
      backgroundColor: colors.accent,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.accent,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    primaryText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
    secondaryBtn: {
      width: '100%',
      height: 54,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: {
      color: colors.accent,
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 2,
    },
    footer: {
      marginTop: 32,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}