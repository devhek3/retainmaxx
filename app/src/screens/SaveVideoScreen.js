import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';

export default function SaveVideoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SAVE VIDEO</Text>
      <Text style={styles.title}>Keep a video for later</Text>
      <Text style={styles.description}>
        Paste a video link and we’ll save it to the topic you choose.
      </Text>
      <TextInput
        accessibilityLabel="Video link"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Paste a video link"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10, marginBottom: 28 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, color: colors.text, fontSize: 16, paddingHorizontal: 16, paddingVertical: 15 },
});
