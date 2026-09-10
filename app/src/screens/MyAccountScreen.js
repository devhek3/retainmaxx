import { StyleSheet, View } from 'react-native';

import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { fontWeights } from '../theme/typography';
import Wordmark from '../components/Wordmark';

export default function MyAccountScreen() {
  return (
    <View style={styles.container}>
      <Wordmark style={styles.wordmark} />
      <AppText style={styles.eyebrow}>REVIEW</AppText>
      <AppText fontRole="display" style={styles.title}>Review your knowledge</AppText>
      <AppText style={styles.description}>Revisit your saved ideas and keep useful knowledge fresh.</AppText>
      <View style={styles.avatar} accessibilityLabel="Profile placeholder">
        <AppText style={styles.avatarText}>You</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  wordmark: { marginBottom: 26 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: fontWeights.extraBold, letterSpacing: 1.1, marginBottom: 10 },
  title: { color: colors.text, fontSize: 30, fontWeight: fontWeights.extraBold, letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10 },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 38, backgroundColor: colors.primary, marginTop: 32 },
  avatarText: { color: colors.surface, fontSize: 16, fontWeight: fontWeights.extraBold },
});
