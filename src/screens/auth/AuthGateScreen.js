// src/screens/auth/AuthGateScreen.js
//
// A warm, inviting "you need an account for this" gate. Shown as a modal
// when a logged-out user taps a create/restricted action (e.g. the "+"
// on the profile). Animated parchment → terracotta gradient background,
// logo, headline, and two buttons (Sign in / Create account).
//
// Requires expo-linear-gradient:
//   npx expo install expo-linear-gradient

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { useT } from '../../i18n';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// Brand palette
const PARCHMENT = '#FAF7F2';
const TERRACOTTA = '#C97060';
const TERRACOTTA_DEEP = '#A84F40';
const NAVY = '#2D4A6E';

export default function AuthGateScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  // Animate the gradient by sliding its start/end points slowly back and
  // forth. RN LinearGradient can't animate colors directly, so we animate
  // the gradient's angle/position via an interpolated `start`/`end`.
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  // Animate the gradient end-point to create a slow shifting wash.
  const endX = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0.2] });
  const endY = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const goLogin = () => navigation.replace('Login');
  const goRegister = () => navigation.replace('Register');

  return (
    <View style={styles.root}>
      <AnimatedGradient
        colors={[PARCHMENT, TERRACOTTA, TERRACOTTA_DEEP]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: endX, y: endY }}
        style={StyleSheet.absoluteFill}
      />

      {/* Close */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.close, { top: insets.top + 8 }]}
        hitSlop={10}
        accessibilityLabel={t('close') ?? 'Close'}
      >
        <X size={24} color="#fff" strokeWidth={2.5} />
      </Pressable>

      <View style={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../../assets/logo-light.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          {t('authGateTitle') ?? 'Join the Staff Arts community'}
        </Text>
        <Text style={styles.subtitle}>
          {t('authGateSubtitle') ??
            'Sign in to share your art, follow artists, and connect with collectors.'}
        </Text>

        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <Pressable
          onPress={goLogin}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.primaryText}>
            {(t('authLogIn') ?? 'Sign in').toUpperCase()}
          </Text>
        </Pressable>

        <Pressable
          onPress={goRegister}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.secondaryText}>
            {(t('authCreateAccount') ?? 'Create account').toUpperCase()}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PARCHMENT },
  close: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 120,
    alignItems: 'center',
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logo: { width: 110, height: 110 },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    marginTop: 14,
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});