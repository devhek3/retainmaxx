import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

export default function Wordmark({ style }) {
  return (
    <Text accessibilityLabel="RetainMaxx" style={[styles.wordmark, style]}>
      <Text style={styles.retain}>Retain</Text>
      <Text style={styles.maxx}>Maxx</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.25,
    lineHeight: 39,
  },
  retain: { color: '#11131B' },
  maxx: { color: colors.primary },
});
