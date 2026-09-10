import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Search } from 'lucide-react-native';

import SavedVideoRow from '../components/SavedVideoRow';
import Wordmark from '../components/Wordmark';
import { colors } from '../theme/colors';
import { SAVED_VIDEOS } from '../videoQueue/savedVideos';

const FILTERS = [
  { label: 'All', topic: null },
  { label: 'Fitness', topic: 'Fitness' },
  { label: 'Tech', topic: 'Technology' },
  { label: 'Mindset', topic: 'Mindset' },
  { label: 'Finance', topic: 'Finance' },
];

export default function SaveVideoScreen({ onViewAll = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const selectedFilter = FILTERS.find(({ label }) => label === activeFilter);
  const visibleVideos = selectedFilter?.topic
    ? SAVED_VIDEOS.filter(({ topic }) => topic === selectedFilter.topic)
    : SAVED_VIDEOS;

  return (
    <ScrollView
      accessibilityLabel="Library"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Wordmark />
          <Text style={styles.tagline}>Your knowledge library.</Text>
        </View>
        <Pressable
          accessibilityLabel="Search library"
          accessibilityRole="button"
          style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}
        >
          <Search color={colors.text} size={25} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        accessibilityLabel="Library filters"
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroller}
      >
        {FILTERS.map((filter) => {
          const isActive = filter.label === activeFilter;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={filter.label}
              onPress={() => setActiveFilter(filter.label)}
              style={({ pressed }) => [
                styles.filter,
                isActive && styles.activeFilter,
                pressed && !isActive && styles.filterPressed,
              ]}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{filter.label}</Text>
            </Pressable>
          );
        })}
        <ChevronRight color={colors.muted} size={22} strokeWidth={2.1} style={styles.filterChevron} />
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Recently Saved</Text>
        <Pressable
          accessibilityHint="Opens every saved video"
          accessibilityLabel="See all saved videos"
          accessibilityRole="button"
          onPress={onViewAll}
          style={({ pressed }) => [styles.seeAll, pressed && styles.seeAllPressed]}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight color={colors.primary} size={21} strokeWidth={2.1} />
        </Pressable>
      </View>

      <View accessibilityLiveRegion="polite" style={styles.list}>
        {visibleVideos.map((video) => <SavedVideoRow key={video.id} video={video} />)}
        {visibleVideos.length === 0 ? (
          <Text style={styles.emptyText}>No saved videos in this topic yet.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 24, paddingHorizontal: 20, paddingTop: 30 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  tagline: { color: '#8B91A0', fontSize: 15, lineHeight: 20, marginTop: 2 },
  searchButton: { alignItems: 'center', backgroundColor: '#FAFAFB', borderRadius: 999, height: 50, justifyContent: 'center', width: 50 },
  searchButtonPressed: { backgroundColor: colors.primarySoft },
  filterScroller: { marginHorizontal: -1, marginTop: 23 },
  filters: { alignItems: 'center', gap: 10, paddingRight: 4 },
  filter: { alignItems: 'center', borderRadius: 999, justifyContent: 'center', minHeight: 40, minWidth: 56, paddingHorizontal: 13 },
  activeFilter: { backgroundColor: '#111318' },
  filterPressed: { backgroundColor: colors.backgroundSecondary },
  filterText: { color: '#555B68', fontSize: 15, fontWeight: '500' },
  activeFilterText: { color: colors.surface },
  filterChevron: { marginLeft: -4 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 32 },
  sectionTitle: { color: '#10131B', fontSize: 21, fontWeight: '700', letterSpacing: -0.55 },
  seeAll: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', minHeight: 36, paddingLeft: 8 },
  seeAllPressed: { backgroundColor: colors.primarySoft },
  seeAllText: { color: colors.primary, fontSize: 14, fontWeight: '500', marginRight: 5 },
  list: { gap: 11 },
  emptyText: { color: colors.muted, fontSize: 14, paddingVertical: 28, textAlign: 'center' },
});
