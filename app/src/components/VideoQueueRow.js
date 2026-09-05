import { StyleSheet, Text, View } from 'react-native';
import { Check, Clock3, Link2, LoaderCircle } from 'lucide-react-native';

import { colors } from '../theme/colors';

export default function VideoQueueRow({ item }) {
  const isProcessing = item.status === 'Processing';
  const isReady = item.status === 'Ready';
  const StatusIcon = isProcessing ? LoaderCircle : isReady ? Check : Clock3;

  return (
    <View
      accessible
      accessibilityLabel={`${item.title}. ${item.topic}. ${item.status}${isProcessing ? `, ${item.progress}% complete` : ''}`}
      style={styles.queueRow}
    >
      <View style={[styles.queueIcon, isReady && styles.queueIconReady]}>
        <Link2 color={isReady ? colors.success : colors.primary} size={19} strokeWidth={2.2} />
      </View>
      <View style={styles.queueDetails}>
        <Text numberOfLines={1} style={styles.queueTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.queueTopic}>{item.topic} · automatic match</Text>
        {isProcessing ? (
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: item.progress }}
            style={styles.progressTrack}
          >
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
        ) : null}
      </View>
      <View style={[styles.statusBadge, isReady && styles.statusBadgeReady, isProcessing && styles.statusBadgeProcessing]}>
        <StatusIcon color={isReady ? colors.success : isProcessing ? colors.primaryDark : colors.muted} size={13} strokeWidth={2.5} />
        <Text style={[styles.statusText, isReady && styles.statusTextReady, isProcessing && styles.statusTextProcessing]}>{item.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  queueRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', minHeight: 76, paddingHorizontal: 13, paddingVertical: 11 },
  queueIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 11, height: 40, justifyContent: 'center', marginRight: 11, width: 40 },
  queueIconReady: { backgroundColor: '#DDF8E5' },
  queueDetails: { flex: 1, minWidth: 0, paddingRight: 8 },
  queueTitle: { color: colors.text, fontSize: 14, fontWeight: '700', letterSpacing: -0.15 },
  queueTopic: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  progressTrack: { backgroundColor: colors.primarySoft, borderRadius: 99, height: 4, marginTop: 7, overflow: 'hidden', width: '100%' },
  progressFill: { backgroundColor: colors.primary, borderRadius: 99, height: '100%' },
  statusBadge: { alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: 8, flexDirection: 'row', gap: 4, justifyContent: 'center', paddingVertical: 5, width: 88 },
  statusBadgeProcessing: { backgroundColor: colors.primarySoft },
  statusBadgeReady: { backgroundColor: '#DDF8E5' },
  statusText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  statusTextProcessing: { color: colors.primaryDark },
  statusTextReady: { color: colors.success },
});
