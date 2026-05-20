// src/screens/newArtwork/NewArtworkScreen.js
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

export default function NewArtworkScreen() {
  const { colors, fontSize } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();

  const rightSpacer = <View style={{ width: 36 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('newArtworkTitle') || 'New Artwork'}
        left={
          <HeaderIconButton
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('navClose') || 'Close'}
          >
            <X size={22} color="#fff" strokeWidth={2} />
          </HeaderIconButton>
        }
        right={rightSpacer}
      />

      <View style={styles.body}>
        <Text
          style={[
            styles.placeholderTitle,
            { color: colors.text, fontSize: fontSize.lg },
          ]}
        >
          {t('newArtworkHeading') || 'Add a new artwork'}
        </Text>
        <Text
          style={[
            styles.placeholderSub,
            { color: colors.textMuted, fontSize: fontSize.sm },
          ]}
        >
          {t('newArtworkSub') ||
            'Form coming soon — title, medium, dimensions, images, price.'}
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
    maxWidth: 280,
  },
});