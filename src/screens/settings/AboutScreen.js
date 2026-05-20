// src/screens/settings/AboutScreen.js
//
// App information: logo, company, version, contact email, links.

import { View, Text, ScrollView, Image, Pressable, Linking, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

const APP_VERSION = '1.0.0';
const COMPANY = 'Qup DA';
const ORG_NUMBER = '912 372 022';
const SUPPORT_EMAIL = 'post@staffarts.com';
const WEBSITE = 'https://staffarts.com';

export default function AboutScreen() {
  const { colors, fontSize } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('settingsAbout') ?? 'About'}
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

      <ScrollView
        contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: 60 }}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require('../../../assets/focus_logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={[styles.appName, { color: colors.text }]}>
          {t('appName') ?? 'Staff Arts'}
        </Text>
        <Text style={[styles.tagline, { color: colors.textMuted, fontSize: fontSize.xs }]}>
          {t('appTagline') ?? 'AN ART MARKETPLACE'}
        </Text>

        <View style={{ height: 32 }} />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight ?? '#eee' }]}>
          <Row
            label={t('aboutVersion') ?? 'Version'}
            value={`v${APP_VERSION}`}
            colors={colors}
            fontSize={fontSize}
          />
          <Divider colors={colors} />
          <Row
            label={t('aboutCompany') ?? 'Company'}
            value={COMPANY}
            colors={colors}
            fontSize={fontSize}
          />
          <Divider colors={colors} />
          <Row
            label={t('aboutOrgNumber') ?? 'Org. number'}
            value={ORG_NUMBER}
            colors={colors}
            fontSize={fontSize}
          />
        </View>

        <View style={{ height: 24 }} />

        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.linkText, { color: colors.accent }]}>
            {SUPPORT_EMAIL}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(WEBSITE)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.linkText, { color: colors.accent }]}>
            {WEBSITE.replace(/^https?:\/\//, '')}
          </Text>
        </Pressable>

        <View style={{ height: 32 }} />

        <Text style={[styles.copyright, { color: colors.textMuted, fontSize: fontSize.xs }]}>
          © 2026 Qup DA. {t('aboutAllRightsReserved') ?? 'All rights reserved.'}
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, colors, fontSize }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: fontSize.md,
          fontWeight: '600',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider({ colors }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.borderLight ?? '#eee',
      }}
    />
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  logo: { width: 100, height: 100 },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tagline: {
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  link: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  copyright: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});