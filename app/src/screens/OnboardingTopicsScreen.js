import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import AppText from '../components/AppText';
import {
  MINIMUM_TOPIC_SELECTION,
  TOPICS,
  hasMinimumTopicSelection,
} from '../onboarding/topicCatalog.cjs';
import Wordmark from '../components/Wordmark';
import { colors } from '../theme/colors';
import { fontWeights, typography } from '../theme/typography';

export default function OnboardingTopicsScreen({ onComplete, savePreferences }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [validationMessage, setValidationMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCount = selectedTopics.length;
  const isComplete = hasMinimumTopicSelection(selectedTopics);

  function toggleTopic(topic) {
    if (isSaving) {
      return;
    }

    setSelectedTopics((currentTopics) => {
      const isSelected = currentTopics.includes(topic);
      return isSelected
        ? currentTopics.filter((selectedTopic) => selectedTopic !== topic)
        : [...currentTopics, topic];
    });
    setValidationMessage(null);
  }

  async function handleContinue() {
    if (!isComplete) {
      setValidationMessage(`Choose ${MINIMUM_TOPIC_SELECTION - selectedCount} more topic${MINIMUM_TOPIC_SELECTION - selectedCount === 1 ? '' : 's'} to continue.`);
      return;
    }

    setIsSaving(true);
    setValidationMessage(null);

    try {
      const preferences = await savePreferences(selectedTopics);
      onComplete(preferences.selectedTopics);
    } catch {
      setValidationMessage('We could not save your topics. Please try again.');
      setIsSaving(false);
    }
  }

  function renderTopic({ item: topic }) {
    const isSelected = selectedTopics.includes(topic);

    return (
      <Pressable
        accessibilityHint="Double tap to select or remove this topic"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected, disabled: isSaving }}
        onPress={() => toggleTopic(topic)}
        style={({ pressed }) => [
          styles.topic,
          isSelected && styles.topicSelected,
          pressed && !isSaving && styles.topicPressed,
        ]}
      >
        <AppText style={[typography.scale.topicCardTitle, styles.topicText, isSelected && styles.topicTextSelected]}>{topic}</AppText>
        <AppText accessibilityElementsHidden style={[styles.checkmark, isSelected && styles.checkmarkSelected]}>
          {isSelected ? '✓' : '+'}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        accessibilityLabel="Topic catalogue"
        contentContainerStyle={styles.listContent}
        data={TOPICS}
        keyExtractor={(topic) => topic}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Wordmark style={styles.wordmark} />
            <AppText style={styles.eyebrow}>WELCOME</AppText>
            <AppText fontRole="display" style={styles.title}>What do you want to remember?</AppText>
            <AppText style={styles.description}>
              Pick at least {MINIMUM_TOPIC_SELECTION} topics. We’ll use them to organize the useful things you save.
            </AppText>
            <View accessibilityLiveRegion="polite" style={[styles.selectionStatus, isComplete && styles.selectionStatusComplete]}>
              <AppText style={[styles.selectionStatusText, isComplete && styles.selectionStatusTextComplete]}>
                {selectedCount} of {MINIMUM_TOPIC_SELECTION} selected
              </AppText>
              <AppText style={[styles.selectionStatusHelper, isComplete && styles.selectionStatusTextComplete]}>
                {isComplete ? 'You’re ready to continue.' : `${MINIMUM_TOPIC_SELECTION - selectedCount} more to go`}
              </AppText>
            </View>
            <AppText style={styles.sectionLabel}>CHOOSE YOUR INTERESTS</AppText>
          </View>
        )}
        renderItem={renderTopic}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.footer}>
        {validationMessage ? (
          <AppText accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.validationMessage}>
            {validationMessage}
          </AppText>
        ) : null}
        <Pressable
          accessibilityHint={isComplete ? 'Saves your topics and opens the app' : `Select ${MINIMUM_TOPIC_SELECTION - selectedCount} more topics first`}
          accessibilityRole="button"
          accessibilityState={{ busy: isSaving }}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            !isComplete && styles.continueButtonIncomplete,
            pressed && !isSaving && styles.continueButtonPressed,
          ]}
        >
          {isSaving ? <ActivityIndicator color={colors.surface} /> : <AppText style={styles.continueLabel}>Continue</AppText>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { paddingTop: 24, paddingBottom: 20 },
  wordmark: { marginBottom: 26 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: fontWeights.bold, letterSpacing: 1.1, marginBottom: 12 },
  title: { color: colors.text, fontSize: 32, fontWeight: fontWeights.bold, letterSpacing: -0.8, lineHeight: 38 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 12 },
  selectionStatus: { alignSelf: 'flex-start', backgroundColor: colors.backgroundSecondary, borderRadius: 12, marginTop: 24, paddingHorizontal: 12, paddingVertical: 10 },
  selectionStatusComplete: { backgroundColor: colors.primarySoft },
  selectionStatusText: { color: colors.text, fontSize: 14, fontWeight: fontWeights.bold },
  selectionStatusHelper: { color: colors.muted, fontSize: 13, marginTop: 2 },
  selectionStatusTextComplete: { color: colors.primaryDark },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: fontWeights.bold, letterSpacing: 1, marginTop: 28 },
  topic: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, minHeight: 52, paddingHorizontal: 14, paddingVertical: 10 },
  topicSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  topicPressed: { backgroundColor: colors.backgroundSecondary },
  topicText: { color: colors.text, flex: 1, paddingRight: 12 },
  topicTextSelected: { color: colors.primaryDark },
  checkmark: { color: colors.mutedLight, fontSize: 20, fontWeight: fontWeights.semibold },
  checkmarkSelected: { color: colors.primary, fontWeight: fontWeights.extraBold },
  footer: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  validationMessage: { color: colors.error, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  continueButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', minHeight: 52, paddingHorizontal: 20 },
  continueButtonIncomplete: { backgroundColor: colors.mutedLight },
  continueButtonPressed: { backgroundColor: colors.primaryDark },
  continueLabel: { color: colors.surface, fontSize: 16, fontWeight: fontWeights.bold },
});
