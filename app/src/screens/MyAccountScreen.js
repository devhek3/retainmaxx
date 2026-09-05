import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import Wordmark from '../components/Wordmark';

export default function MyAccountScreen() {
  return (
    <View style={styles.container}>
      <Wordmark style={styles.wordmark} />
      <Text style={styles.eyebrow}>MY ACCOUNT</Text>
      <Text style={styles.title}>Your profile</Text>
      <Text style={styles.description}>Account preferences and saved-video settings will live here.</Text>
      <View style={styles.avatar} accessibilityLabel="Profile placeholder">
        <Text style={styles.avatarText}>You</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  wordmark: { marginBottom: 26 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10 },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 38, backgroundColor: colors.primary, marginTop: 32 },
  avatarText: { color: colors.surface, fontSize: 16, fontWeight: '800' },
});
