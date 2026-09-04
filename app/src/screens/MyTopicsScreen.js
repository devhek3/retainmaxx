import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function MyTopicsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>MY TOPICS</Text>
      <Text style={styles.title}>Your saved interests</Text>
      <Text style={styles.description}>Create topics to keep the videos you care about organized.</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No topics yet</Text>
        <Text style={styles.emptyText}>Your first saved video can start one.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10 },
  emptyState: { marginTop: 32, padding: 20, borderRadius: 16, backgroundColor: colors.primarySoft },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 14, marginTop: 6 },
});
