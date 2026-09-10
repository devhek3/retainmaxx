import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import AppText from '../components/AppText';
import SavedVideoRow from '../components/SavedVideoRow';
import { colors } from '../theme/colors';
import { fontWeights } from '../theme/typography';
import { SAVED_VIDEOS } from '../videoQueue/savedVideos';

export default function AllSavesScreen({ onBack, onSelectVideo }) {
  return (
    <ScrollView accessibilityLabel="All saved videos" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.navigationRow}>
        <Pressable
          accessibilityHint="Returns to the Library screen"
          accessibilityLabel="Back to Library"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <ArrowLeft color={colors.text} size={22} strokeWidth={2.1} />
        </Pressable>
        <AppText style={styles.navigationTitle}>Library</AppText>
        <View style={styles.navigationSpacer} />
      </View>
      <AppText accessibilityRole="header" fontRole="display" style={styles.title}>All saved videos</AppText>
      <AppText style={styles.description}>{SAVED_VIDEOS.length} videos in your knowledge library</AppText>
      <View style={styles.list}>
        {SAVED_VIDEOS.map((video) => (
          <SavedVideoRow key={video.id} onPress={onSelectVideo} video={video} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 20 },
  navigationRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  navigationTitle: { color: colors.text, fontSize: 16, fontWeight: fontWeights.semibold },
  navigationSpacer: { height: 44, width: 44 },
  backButton: { alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: 999, height: 44, justifyContent: 'center', width: 44 },
  backButtonPressed: { backgroundColor: colors.primarySoft },
  title: { color: colors.text, fontSize: 29, fontWeight: fontWeights.bold, letterSpacing: -0.8, marginTop: 28 },
  description: { color: colors.muted, fontSize: 15, marginTop: 6 },
  list: { gap: 13, marginTop: 26 },
});
