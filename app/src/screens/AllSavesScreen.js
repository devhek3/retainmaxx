import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import SavedVideoRow from '../components/SavedVideoRow';
import Wordmark from '../components/Wordmark';
import { colors } from '../theme/colors';
import { SAVED_VIDEOS } from '../videoQueue/savedVideos';

export default function AllSavesScreen({ onBack }) {
  return (
    <ScrollView accessibilityLabel="All saved videos" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Wordmark style={styles.wordmark} />
      <Pressable
        accessibilityHint="Returns to the Library screen"
        accessibilityLabel="Back to Library"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <ArrowLeft color={colors.primary} size={19} strokeWidth={2.2} />
        <Text style={styles.backButtonText}>Library</Text>
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>All saved videos</Text>
      <Text style={styles.description}>Your complete knowledge library.</Text>
      <View style={styles.list}>
        {SAVED_VIDEOS.map((video) => <SavedVideoRow key={video.id} video={video} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 30 },
  wordmark: { marginBottom: 18 },
  backButton: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 8, flexDirection: 'row', gap: 5, minHeight: 36, paddingRight: 8 },
  backButtonPressed: { backgroundColor: colors.primarySoft },
  backButtonText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.7, marginTop: 18 },
  description: { color: colors.muted, fontSize: 15, marginTop: 5 },
  list: { gap: 11, marginTop: 22 },
});
