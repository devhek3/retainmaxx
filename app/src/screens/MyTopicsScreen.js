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
  Leaf,
  Search,
  Sparkles,
  Utensils,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

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
  Mindset: { count: 14, countLabel: 'saved', recency: 'Viewed 2h ago', artwork: 'mountains' },
  Psychology: { count: 14, countLabel: 'saved', recency: 'Viewed 2h ago', artwork: 'mountains' },
  Nutrition: { count: 10, recency: 'Viewed 1d ago', artwork: 'leaves' },
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
      <View>
        <AppText accessibilityRole="header" fontRole="display" style={styles.wordmark}>
          Retain<AppText style={styles.wordmarkAccent}>Maxx</AppText>
        </AppText>
        <AppText style={styles.tagline}>Browse by topic.</AppText>
      </View>
      <View accessible accessibilityLabel="Search" style={styles.searchButton}>
        <Search color="#171B27" size={24} strokeWidth={2} />
      </View>
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
      <View style={styles.topicCardBody}>
        <AppText adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.topicName}>{topic}</AppText>
        <AppText style={styles.topicCount}>{activity.count} {countLabel}</AppText>
      </View>
      <ChevronRight accessible={false} color="#525B6B" size={20} strokeWidth={1.9} style={styles.topicChevron} />
    </View>
  );
}

function TopicArtwork({ variant }) {
  if (variant === 'leaves') {
    return (
      <Svg accessibilityLabel="Dark green leaves" height="52" viewBox="0 0 64 58" width="57">
        <Rect fill="#10251B" height="58" rx="9" width="64" />
        <Path d="M9 58C12 31 25 13 43 4C43 29 32 48 9 58Z" fill="#456D52" />
        <Path d="M18 58C26 37 39 23 61 16C57 40 42 54 18 58Z" fill="#274A36" />
        <Path d="M13 50L41 11M25 54L57 21M22 37L12 31M34 31L28 20M38 42L54 38" stroke="#91A795" strokeWidth="1" />
      </Svg>
    );
  }

  return (
    <Svg accessibilityLabel="Mountain landscape" height="52" viewBox="0 0 64 58" width="57">
      <Defs>
        <LinearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#BFCAD1" />
          <Stop offset="1" stopColor="#E7C9A6" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#sky)" height="58" rx="9" width="64" />
      <Path d="M0 47L17 28L29 40L42 19L64 47V58H0Z" fill="#334750" />
      <Path d="M0 51L21 38L36 48L51 35L64 44V58H0Z" fill="#1F3038" />
    </Svg>
  );
}

function RecentTopicCard({ topic }) {
  const activity = TOPIC_ACTIVITY[topic];

  return (
    <View accessible accessibilityLabel={`${topic}, ${activity.recency}`} style={styles.recentCard}>
      <TopicArtwork variant={activity.artwork} />
      <View style={styles.recentCopy}>
        <AppText numberOfLines={1} style={styles.recentTopicName}>{topic}</AppText>
        <AppText style={styles.recentRecency}>{activity.recency}</AppText>
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

function RecentTopics({ selectedTopics }) {
  const recentTopics = selectedTopics.filter((topic) => TOPIC_ACTIVITY[topic]?.recency).slice(0, 2);

  return (
    <View style={styles.recentSection}>
      <View style={styles.recentHeadingRow}>
        <AppText accessibilityRole="header" style={styles.recentTitle}>Recently active topics</AppText>
        <View accessible accessibilityLabel="See all recently active topics" style={styles.seeAll}>
          <AppText style={styles.seeAllText}>See all</AppText>
          <ChevronRight color={colors.primary} size={18} strokeWidth={2.4} />
        </View>
      </View>
      {recentTopics.length > 0 ? (
        <View style={styles.recentCards}>
          {recentTopics.map((topic) => <RecentTopicCard key={topic} topic={topic} />)}
        </View>
      ) : (
        <View accessible accessibilityLabel="No recent topic activity" style={styles.recentEmpty}>
          <View style={styles.recentEmptyIcon}>
            <Leaf color={colors.primary} size={21} strokeWidth={2} />
          </View>
          <View style={styles.recentEmptyCopy}>
            <AppText style={styles.recentEmptyTitle}>Your recent topics will appear here</AppText>
            <AppText style={styles.recentEmptyDescription}>Save an idea to start your activity.</AppText>
          </View>
        </View>
      )}
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
      ListFooterComponent={selectedTopics.length > 0 ? <RecentTopics selectedTopics={selectedTopics} /> : null}
      ListHeaderComponent={<TopicsHeader />}
      numColumns={2}
      renderItem={({ item, index }) => <TopicCard index={index} topic={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 24 },
  brandHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 31 },
  wordmark: { color: '#111522', fontSize: 34, fontWeight: fontWeights.bold, letterSpacing: -1.15, lineHeight: 40 },
  wordmarkAccent: { color: colors.primary },
  tagline: { color: '#8A91A1', fontSize: 15, lineHeight: 21, marginTop: 1 },
  searchButton: { alignItems: 'center', backgroundColor: '#F7F7F8', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 },
  sectionTitle: { color: '#111522', fontSize: 24, fontWeight: fontWeights.bold, letterSpacing: -0.5, lineHeight: 30, marginBottom: 16 },
  topicRow: { gap: 12 },
  topicCard: { borderColor: '#ECEEF2', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flex: 1, height: 104, justifyContent: 'space-between', marginBottom: 12, maxWidth: '50%', padding: 18 },
  topicCardFeatured: { backgroundColor: '#F7F5FF', borderColor: '#E8E2FF' },
  topicChevron: { position: 'absolute', right: 14, top: 41 },
  topicCardBody: { bottom: 13, left: 18, position: 'absolute', right: 14 },
  topicName: { color: '#111522', fontSize: 15, fontWeight: fontWeights.semibold, letterSpacing: -0.2, lineHeight: 19 },
  topicCount: { color: '#7D8595', fontSize: 13, lineHeight: 18, marginTop: 1 },
  recentSection: { borderTopColor: '#ECEEF2', borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 22 },
  recentHeadingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  recentTitle: { color: '#111522', fontSize: 17, fontWeight: fontWeights.bold, letterSpacing: -0.2, lineHeight: 22 },
  seeAll: { alignItems: 'center', flexDirection: 'row', gap: 2 },
  seeAllText: { color: colors.primary, fontSize: 14, fontWeight: fontWeights.semibold, lineHeight: 20 },
  recentCards: { flexDirection: 'row', gap: 12 },
  recentCard: { alignItems: 'center', borderColor: '#ECEEF2', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flex: 1, flexDirection: 'row', minWidth: 0, padding: 9 },
  recentCopy: { flex: 1, marginLeft: 10, minWidth: 0 },
  recentTopicName: { color: '#111522', fontSize: 14, fontWeight: fontWeights.semibold, lineHeight: 18 },
  recentRecency: { color: '#7D8595', fontSize: 12, lineHeight: 16, marginTop: 2 },
  recentEmpty: { alignItems: 'center', borderColor: '#ECEEF2', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', padding: 14 },
  recentEmptyIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 10, height: 44, justifyContent: 'center', width: 44 },
  recentEmptyCopy: { flex: 1, marginLeft: 12 },
  recentEmptyTitle: { color: colors.text, fontSize: 14, fontWeight: fontWeights.bold },
  recentEmptyDescription: { color: colors.muted, fontSize: 12, marginTop: 3 },
  emptyState: { alignItems: 'center', backgroundColor: '#F7F7F8', borderRadius: 16, marginTop: 8, paddingHorizontal: 24, paddingVertical: 28 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: fontWeights.bold, textAlign: 'center' },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: 'center' },
});
