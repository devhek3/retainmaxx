import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function MyTopicsScreen({ selectedTopics = [] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>MY TOPICS</Text>
      <Text style={styles.title}>Your saved interests</Text>
      <Text style={styles.description}>The things you save will be organized into these interests.</Text>
      <View style={styles.topicList}>
        {selectedTopics.map((topic) => (
          <View key={topic} style={styles.topicPill}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10 },
  topicList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 28 },
  topicPill: { backgroundColor: colors.primarySoft, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  topicText: { color: colors.primaryDark, fontSize: 14, fontWeight: '600' },
});
