import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

export default function Wordmark({ style }) {
  return (
    <Text accessibilityLabel="RetainMaxx" style={[styles.wordmark, style]}>
      RetainMaxx
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.45,
  },
});
