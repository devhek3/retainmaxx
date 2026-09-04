import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  BookOpen,
  BriefcaseBusiness,
  Dumbbell,
  Landmark,
  Plane,
  Sparkles,
} from 'lucide-react-native';

import { colors } from '../theme/colors';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TOPIC_ACCENTS = [
  { backgroundColor: '#E9E0FF', color: '#5728D9' },
  { backgroundColor: '#DDF8E5', color: '#15803D' },
  { backgroundColor: '#FFE7CB', color: '#C2410C' },
  { backgroundColor: '#DDEBFF', color: '#2563EB' },
  { backgroundColor: '#FFF0C7', color: '#A16207' },
];

const TOPIC_ICONS = {
  'AI & Machine Learning': Sparkles,
  'Career Growth': BriefcaseBusiness,
  Fitness: Dumbbell,
  Investing: Landmark,
  'Personal Finance': Landmark,
  Travel: Plane,
};

function TopicRow({ topic, index }) {
  const accent = TOPIC_ACCENTS[index % TOPIC_ACCENTS.length];
  const TopicIcon = TOPIC_ICONS[topic] ?? BookOpen;

  return (
    <View
      accessible
      accessibilityLabel={`${topic}, 0 saved, nothing saved yet`}
      style={styles.topicRow}
    >
      <View style={[styles.topicIcon, { backgroundColor: accent.backgroundColor }]}>
        <TopicIcon accessible={false} color={accent.color} size={20} strokeWidth={2.25} />
      </View>
      <View style={styles.topicDetails}>
        <Text style={styles.topicName}>{topic}</Text>
        <Text style={styles.topicRecency}>Nothing saved yet</Text>
      </View>
      <View style={styles.topicCount}>
        <Text style={styles.topicCountLabel}>0 saved</Text>
      </View>
    </View>
  );
}

function WeeklyMomentum() {
  return (
    <View accessible accessibilityLabel="This week, 0 ideas saved" style={styles.momentumCard}>
      <Text accessibilityRole="header" style={styles.momentumTitle}>This week</Text>
      <Text style={styles.momentumDescription}>
        Your weekly rhythm will build here as you save ideas.
      </Text>
      <View accessibilityLabel="Ideas saved by weekday" style={styles.week}>
        {WEEK_DAYS.map((day) => (
          <View key={day} style={styles.day}>
            <Text style={styles.dayLabel}>{day}</Text>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 1, now: 0 }}
              style={styles.track}
            >
              <View style={styles.trackFill} />
            </View>
            <Text style={styles.dayValue}>0</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TopicsHeader({ topicCount }) {
  const topicLabel = `${topicCount} ${topicCount === 1 ? 'topic' : 'topics'}`;
  const hasTopics = topicCount > 0;

  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>MY TOPICS</Text>

      {hasTopics ? <WeeklyMomentum /> : null}

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Recent activity</Text>
        <Text style={styles.sectionSummary}>0 ideas across {topicLabel}</Text>
      </View>
    </View>
  );
}

function EmptyTopics() {
  return (
    <View style={styles.emptyState}>
      <Text accessibilityRole="header" style={styles.emptyTitle}>Your topics will appear here.</Text>
      <Text style={styles.emptyDescription}>Choose your interests during onboarding to start organizing what you save.</Text>
    </View>
  );
}

export default function MyTopicsScreen({ selectedTopics = [] }) {
  const hasTopics = selectedTopics.length > 0;

  return (
    <FlatList
      accessibilityLabel="My topics"
      contentContainerStyle={styles.content}
      data={selectedTopics}
      keyExtractor={(topic) => topic}
      ListEmptyComponent={<EmptyTopics />}
      ListHeaderComponent={<TopicsHeader topicCount={selectedTopics.length} />}
      renderItem={({ item, index }) => <TopicRow index={index} topic={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  header: { paddingBottom: 8 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  sectionHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: colors.text, flex: 1, fontSize: 18, fontWeight: '700', letterSpacing: -0.25 },
  sectionSummary: { color: colors.muted, fontSize: 12, marginLeft: 12, textAlign: 'right' },
  topicRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 82, paddingVertical: 12 },
  topicIcon: { alignItems: 'center', borderRadius: 11, height: 42, justifyContent: 'center', marginRight: 12, width: 42 },
  topicDetails: { flex: 1, minWidth: 0, paddingRight: 8 },
  topicName: { color: colors.text, fontSize: 15, fontWeight: '800', letterSpacing: -0.15 },
  topicRecency: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  topicCount: { alignItems: 'flex-end', paddingLeft: 8 },
  topicCountLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  momentumCard: { backgroundColor: colors.backgroundSecondary, borderRadius: 16, padding: 18 },
  momentumTitle: { color: colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  momentumDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  week: { marginTop: 17, rowGap: 10 },
  day: { alignItems: 'center', flexDirection: 'row' },
  dayLabel: { color: colors.muted, fontSize: 11, width: 28 },
  track: { backgroundColor: colors.border, borderRadius: 99, flex: 1, height: 7, overflow: 'hidden' },
  trackFill: { backgroundColor: colors.primary, borderRadius: 99, height: '100%', width: '0%' },
  dayValue: { color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: 10, textAlign: 'right', width: 12 },
  emptyState: { alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: 16, marginTop: 8, paddingHorizontal: 24, paddingVertical: 28 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: 'center' },
});
