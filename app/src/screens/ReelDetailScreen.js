import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Bookmark, Play, Tag } from 'lucide-react-native';

import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { fontWeights } from '../theme/typography';

export default function ReelDetailScreen({ onBack, video }) {
  return (
    <ScrollView
      accessibilityLabel={`${video.title} saved video details`}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.navigationRow}>
        <Pressable
          accessibilityHint="Returns to the previous Library screen"
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <ArrowLeft color={colors.text} size={22} strokeWidth={2.1} />
        </Pressable>
        <AppText style={styles.navigationTitle}>Saved video</AppText>
        <View style={styles.navigationSpacer} />
      </View>

      <ImageBackground imageStyle={styles.heroImage} source={video.image} style={styles.hero}>
        <View style={styles.heroShade} />
        <View style={styles.sourcePill}>
          <AppText style={styles.sourcePillText}>{video.source}</AppText>
        </View>
        <View accessibilityElementsHidden style={styles.playButton}>
          <Play color={colors.surface} fill={colors.surface} size={25} strokeWidth={1.8} />
        </View>
        <AppText style={styles.heroOverlay}>{video.overlay}</AppText>
      </ImageBackground>

      <View style={styles.topicPill}>
        <View style={styles.topicDot} />
        <AppText style={styles.topicPillText}>{video.topic}</AppText>
      </View>
      <AppText accessibilityRole="header" fontRole="display" style={styles.title}>{video.title}</AppText>

      <View style={styles.metadataCard}>
        <AppText style={styles.metadataHeading}>Video details</AppText>
        <View style={styles.metadataRow}>
          <View style={styles.metadataIcon}>
            <Tag color={colors.primary} size={19} strokeWidth={2} />
          </View>
          <View style={styles.metadataCopy}>
            <AppText style={styles.metadataLabel}>Topic</AppText>
            <AppText style={styles.metadataValue}>{video.topic}</AppText>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.metadataRow}>
          <View style={styles.metadataIcon}>
            <Bookmark color={colors.primary} size={19} strokeWidth={2} />
          </View>
          <View style={styles.metadataCopy}>
            <AppText style={styles.metadataLabel}>Saved from</AppText>
            <AppText style={styles.metadataValue}>{video.source}</AppText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 36, paddingHorizontal: 20, paddingTop: 20 },
  navigationRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  iconButton: { alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: 999, height: 44, justifyContent: 'center', width: 44 },
  iconButtonPressed: { backgroundColor: colors.primarySoft },
  navigationTitle: { color: colors.text, fontSize: 16, fontWeight: fontWeights.semibold },
  navigationSpacer: { height: 44, width: 44 },
  hero: { aspectRatio: 1, justifyContent: 'space-between', overflow: 'hidden', padding: 18, width: '100%' },
  heroImage: { borderRadius: 18 },
  heroShade: { backgroundColor: 'rgba(8, 9, 14, 0.28)', borderRadius: 18, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  sourcePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(17, 19, 27, 0.68)', borderColor: 'rgba(255, 255, 255, 0.22)', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  sourcePillText: { color: colors.surface, fontSize: 12, fontWeight: fontWeights.semibold },
  playButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(109, 61, 245, 0.9)', borderColor: 'rgba(255, 255, 255, 0.45)', borderRadius: 999, borderWidth: 1, height: 64, justifyContent: 'center', paddingLeft: 3, position: 'absolute', top: '42%', width: 64 },
  heroOverlay: { color: colors.surface, fontSize: 18, fontWeight: fontWeights.bold, letterSpacing: 0.2, lineHeight: 21, maxWidth: 160, textTransform: 'uppercase', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 3 },
  topicPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 999, flexDirection: 'row', marginTop: 24, paddingHorizontal: 12, paddingVertical: 7 },
  topicDot: { backgroundColor: colors.primary, borderRadius: 999, height: 6, marginRight: 8, width: 6 },
  topicPillText: { color: colors.primaryDark, fontSize: 13, fontWeight: fontWeights.semibold },
  title: { color: '#10131B', fontSize: 29, fontWeight: fontWeights.bold, letterSpacing: -0.85, lineHeight: 35, marginTop: 12 },
  metadataCard: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginTop: 28, padding: 18 },
  metadataHeading: { color: colors.text, fontSize: 17, fontWeight: fontWeights.semibold, marginBottom: 18 },
  metadataRow: { alignItems: 'center', flexDirection: 'row' },
  metadataIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 10, height: 40, justifyContent: 'center', width: 40 },
  metadataCopy: { flex: 1, marginLeft: 13 },
  metadataLabel: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  metadataValue: { color: colors.text, fontSize: 15, fontWeight: fontWeights.medium, lineHeight: 20, marginTop: 1 },
  divider: { backgroundColor: colors.border, height: 1, marginLeft: 53, marginVertical: 14 },
});
