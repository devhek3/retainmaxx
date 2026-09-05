import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import VideoQueueRow from '../components/VideoQueueRow';
import Wordmark from '../components/Wordmark';
import { colors } from '../theme/colors';

export default function AllSavesScreen({ queue = [], onBack }) {
  return (
    <ScrollView accessibilityLabel="All saved videos" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Wordmark style={styles.wordmark} />
      <Pressable
        accessibilityHint="Returns to the Save video screen"
        accessibilityLabel="Back to Save video"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <ArrowLeft color={colors.primaryDark} size={18} strokeWidth={2.4} />
        <Text style={styles.backButtonText}>Save video</Text>
      </Pressable>
      <Text style={styles.eyebrow}>ALL SAVES</Text>
      <Text accessibilityRole="header" style={styles.title}>Every video in your queue</Text>
      <Text style={styles.description}>
        {queue.length} {queue.length === 1 ? 'video is' : 'videos are'} waiting to be organized.
      </Text>

      <View accessibilityLabel="Complete video queue" style={styles.queue}>
        {queue.map((item) => <VideoQueueRow item={item} key={item.id} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  wordmark: { marginBottom: 26 },
  backButton: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 8, flexDirection: 'row', gap: 5, marginBottom: 20, minHeight: 32, paddingHorizontal: 8 },
  backButtonPressed: { backgroundColor: colors.primarySoft },
  backButtonText: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.15, marginBottom: 8 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.65, lineHeight: 36 },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  queue: { gap: 10, marginTop: 22 },
});
