// src/screens/explore/ExploreScreen.js
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

export default function ExploreScreen() {
  const { colors, fontSize } = useTheme();
  const { t } = useT();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={t('exploreTitle') || 'Explore'} />

      <View style={styles.body}>
        <Text
          style={[
            styles.placeholderTitle,
            { color: colors.text, fontSize: fontSize.lg },
          ]}
        >
          {t('exploreHeading') || 'Discover artists and artworks'}
        </Text>
        <Text
          style={[
            styles.placeholderSub,
            { color: colors.textMuted, fontSize: fontSize.sm },
          ]}
        >
          {t('comingSoon') || 'Coming soon.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontWeight: '300',
    textAlign: 'center',
  },
  placeholderSub: {
    marginTop: 8,
    textAlign: 'center',
  },
});