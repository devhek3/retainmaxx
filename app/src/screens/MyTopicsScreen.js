import { FlatList, StyleSheet, View } from 'react-native';
import {
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  ChevronRight,
  Coins,
  Dumbbell,
  Heart,
  Laptop,
  Sparkles,
  Utensils,
} from 'lucide-react-native';

import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { fontWeights } from '../theme/typography';

const TOPIC_ICONS = {
  'AI & Machine Learning': Sparkles,
  'Career Growth': BriefcaseBusiness,
  Entrepreneurship: BriefcaseBusiness,
  Fitness: Dumbbell,
  Investing: Coins,
  'Mental Health': Heart,
  Mindset: Brain,
  Nutrition: Utensils,
  'Personal Finance': Coins,
  Productivity: BarChart3,
  Psychology: Brain,
  Technology: Laptop,
};

const TOPIC_ACTIVITY = {
  Fitness: { count: 12 },
  Technology: { count: 8 },
  Mindset: { count: 14, countLabel: 'saved' },
  Psychology: { count: 14, countLabel: 'saved' },
  Nutrition: { count: 10 },
  Investing: { count: 9 },
  'Personal Finance': { count: 9 },
  Productivity: { count: 11 },
  'Mental Health': { count: 8 },
  Entrepreneurship: { count: 7 },
  'Career Growth': { count: 7 },
};

function BrandHeader() {
  return (
    <View style={styles.brandHeader}>
      <AppText accessibilityRole="header" fontRole="display" style={styles.wordmark}>
        Retain<AppText style={styles.wordmarkAccent}>Maxx</AppText>
      </AppText>
      <AppText style={styles.tagline}>Browse by topic.</AppText>
    </View>
  );
}

function TopicCard({ topic, index }) {
  const TopicIcon = TOPIC_ICONS[topic] ?? BookOpen;
  const activity = TOPIC_ACTIVITY[topic] ?? { count: 0 };
  const countLabel = activity.countLabel ?? 'items';
  const isFeatured = index === 0;

  return (
    <View
      accessible
      accessibilityLabel={`${topic}, ${activity.count} ${countLabel}`}
      style={[styles.topicCard, isFeatured && styles.topicCardFeatured]}
    >
      <TopicIcon
        accessible={false}
        color={isFeatured ? colors.primary : '#596273'}
        size={28}
        strokeWidth={1.9}
      />
      <ChevronRight accessible={false} color="#525B6B" size={20} strokeWidth={1.9} style={styles.topicChevron} />
      <View style={styles.topicCopy}>
        <AppText adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.topicName}>{topic}</AppText>
        <AppText style={styles.topicCount}>{activity.count} {countLabel}</AppText>
      </View>
    </View>
  );
}

function TopicsHeader() {
  return (
    <View>
      <BrandHeader />
      <AppText accessibilityRole="header" fontRole="display" style={styles.sectionTitle}>Your Topics</AppText>
    </View>
  );
}

function EmptyTopics() {
  return (
    <View style={styles.emptyState}>
      <AppText accessibilityRole="header" style={styles.emptyTitle}>Your topics will appear here.</AppText>
      <AppText style={styles.emptyDescription}>
        Choose your interests during onboarding to start organizing what you save.
      </AppText>
    </View>
  );
}

export default function MyTopicsScreen({ selectedTopics = [] }) {
  return (
    <FlatList
      accessibilityLabel="My topics"
      columnWrapperStyle={selectedTopics.length > 0 ? styles.topicRow : undefined}
      contentContainerStyle={styles.content}
      data={selectedTopics}
      keyExtractor={(topic) => topic}
      ListEmptyComponent={<EmptyTopics />}
      ListHeaderComponent={<TopicsHeader />}
      numColumns={2}
      renderItem={({ item, index }) => <TopicCard index={index} topic={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 24 },
  brandHeader: { alignItems: 'flex-start', marginBottom: 31 },
  wordmark: { color: '#111522', fontSize: 34, fontWeight: fontWeights.bold, letterSpacing: -1.15, lineHeight: 40 },
  wordmarkAccent: { color: colors.primary },
  tagline: { color: '#8A91A1', fontSize: 15, lineHeight: 21, marginTop: 1 },
  sectionTitle: { color: '#111522', fontSize: 24, fontWeight: fontWeights.bold, letterSpacing: -0.5, lineHeight: 30, marginBottom: 16 },
  topicRow: { gap: 12 },
  topicCard: { borderColor: '#ECEEF2', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flex: 1, height: 120, justifyContent: 'space-between', marginBottom: 16, maxWidth: '50%', padding: 20 },
  topicCardFeatured: { backgroundColor: '#F7F5FF', borderColor: '#E8E2FF' },
  topicChevron: { position: 'absolute', right: 18, top: 24 },
  topicName: { color: '#111522', fontSize: 15, fontWeight: fontWeights.semibold, letterSpacing: -0.2, lineHeight: 19 },
  topicCount: { color: '#7D8595', fontSize: 13, lineHeight: 18, marginTop: 1 },
  emptyState: { alignItems: 'center', backgroundColor: '#F7F7F8', borderRadius: 16, marginTop: 8, paddingHorizontal: 24, paddingVertical: 28 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: fontWeights.bold, textAlign: 'center' },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: 'center' },
});
