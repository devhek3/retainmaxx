import { StyleSheet } from 'react-native';

import AppText from './AppText';
import { colors } from '../theme/colors';
import { fontWeights } from '../theme/typography';

export default function Wordmark({ style }) {
  return (
    <AppText accessibilityLabel="RetainMaxx" fontRole="display" style={[styles.wordmark, style]}>
      <AppText style={styles.retain}>Retain</AppText>
      <AppText style={styles.maxx}>Maxx</AppText>
    </AppText>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: 34,
    fontWeight: fontWeights.extraBold,
    letterSpacing: -1.25,
    lineHeight: 39,
  },
  retain: { color: '#11131B' },
  maxx: { color: colors.primary },
});
