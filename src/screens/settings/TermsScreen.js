// src/screens/settings/TermsScreen.js
//
// In-app Terms & Conditions. Renders content from the user's current
// language via `t('termsBody')`. The translation patch ships full bodies
// for all 12 languages.

import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import Header from '../../components/Header';
import HeaderIconButton from '../../components/HeaderIconButton';
import { useTheme } from '../../theme/ThemeContext';
import { useT } from '../../i18n';

export default function TermsScreen() {
  const { colors, fontSize } = useTheme();
  const { t } = useT();
  const navigation = useNavigation();

  const body = t('termsBody');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('settingsTerms') ?? 'Terms & Conditions'}
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: fontSize.sm,
            lineHeight: 22,
          }}
        >
          {body}
        </Text>
      </ScrollView>
    </View>
  );
}