import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, Clock3, Link2, LoaderCircle } from 'lucide-react-native';

import Wordmark from '../components/Wordmark';
import { colors } from '../theme/colors';

const INITIAL_QUEUE = [
  { id: 'mobility', title: 'Morning mobility flow', topic: 'Fitness', status: 'Processing', progress: 64 },
  { id: 'travel', title: 'A simpler travel planning system', topic: 'Travel', status: 'Queued' },
  { id: 'notes', title: 'A practical AI note-taking workflow', topic: 'AI & Machine Learning', status: 'Ready' },
];

function isFullUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function QueueRow({ item }) {
  const isProcessing = item.status === 'Processing';
  const isReady = item.status === 'Ready';
  const StatusIcon = isProcessing ? LoaderCircle : isReady ? Check : Clock3;

  return (
    <View
      accessible
      accessibilityLabel={`${item.title}. ${item.topic}. ${item.status}${isProcessing ? `, ${item.progress}% complete` : ''}`}
      style={styles.queueRow}
    >
      <View style={[styles.queueIcon, isReady && styles.queueIconReady]}>
        <Link2 color={isReady ? colors.success : colors.primary} size={19} strokeWidth={2.2} />
      </View>
      <View style={styles.queueDetails}>
        <Text numberOfLines={1} style={styles.queueTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.queueTopic}>{item.topic} · automatic match</Text>
        {isProcessing ? (
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: item.progress }}
            style={styles.progressTrack}
          >
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
        ) : null}
      </View>
      <View style={[styles.statusBadge, isReady && styles.statusBadgeReady, isProcessing && styles.statusBadgeProcessing]}>
        <StatusIcon color={isReady ? colors.success : isProcessing ? colors.primaryDark : colors.muted} size={13} strokeWidth={2.5} />
        <Text style={[styles.statusText, isReady && styles.statusTextReady, isProcessing && styles.statusTextProcessing]}>{item.status}</Text>
      </View>
    </View>
  );
}

function Feedback({ feedback, onRetry }) {
  if (!feedback) {
    return null;
  }

  const isError = feedback.type === 'error';
  const isWarning = feedback.type === 'warning';
  const isSuccess = feedback.type === 'success';

  return (
    <View
      accessibilityLiveRegion={isError || isWarning ? 'assertive' : 'polite'}
      accessibilityRole={isError || isWarning ? 'alert' : undefined}
      style={[
        styles.feedback,
        isError && styles.feedbackError,
        isWarning && styles.feedbackWarning,
        isSuccess && styles.feedbackSuccess,
      ]}
    >
      <Text style={[styles.feedbackText, isError && styles.feedbackTextError, isWarning && styles.feedbackTextWarning, isSuccess && styles.feedbackTextSuccess]}>
        {feedback.message}
      </Text>
      {feedback.retry ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Try storing this video again" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function SaveVideoScreen({ selectedTopics = [] }) {
  const [link, setLink] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const timerRef = useRef(null);
  const automaticTopic = selectedTopics.includes('Fitness') ? 'Fitness' : selectedTopics[0] ?? 'Fitness';

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function finishStore(value) {
    const normalizedValue = value.toLowerCase();
    setIsSubmitting(false);

    if (normalizedValue.includes('existing')) {
      setFeedback({ type: 'warning', message: 'This video is already in your queue. It won’t be saved twice.' });
      return;
    }

    if (normalizedValue.includes('unavailable')) {
      setFeedback({ type: 'error', message: 'We can’t access this video right now. Check the link or try again.', retry: true });
      return;
    }

    setQueue((currentQueue) => [
      { id: `new-${Date.now()}`, title: 'New video link', topic: automaticTopic, status: 'Queued' },
      ...currentQueue,
    ]);
    setLink('');
    setFeedback({ type: 'success', message: `Added to your queue · ${automaticTopic} matched automatically.` });
  }

  function handleStore() {
    const value = link.trim();

    if (!isFullUrl(value)) {
      setFeedback({ type: 'error', message: 'Add the full link.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: 'loading', message: 'Checking the link…' });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => finishStore(value), 700);
  }

  function handleLinkChange(value) {
    setLink(value);
    if (feedback) {
      setFeedback(null);
    }
  }

  return (
    <ScrollView
      accessibilityLabel="Save video"
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Wordmark style={styles.wordmark} />
      <Text style={styles.eyebrow}>SAVE VIDEO</Text>
      <Text accessibilityRole="header" style={styles.title}>Your video queue</Text>
      <Text style={styles.description}>Keep useful short videos moving into the topics you already follow.</Text>

      <View accessibilityLabel="Video queue" style={styles.queue}>
        {queue.map((item) => <QueueRow item={item} key={item.id} />)}
      </View>

      <View style={styles.saveSection}>
        <Text style={styles.fieldLabel}>Paste a video link</Text>
        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel="Video link"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            keyboardType="url"
            nativeID="video-link"
            onChangeText={handleLinkChange}
            onSubmitEditing={handleStore}
            placeholder="https://…"
            placeholderTextColor={colors.mutedLight}
            returnKeyType="done"
            style={styles.input}
            value={link}
          />
          <Pressable
            accessibilityHint="Checks the link and adds it to your video queue"
            accessibilityLabel={isSubmitting ? 'Adding video' : 'Store video'}
            accessibilityRole="button"
            accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={handleStore}
            style={({ pressed }) => [styles.storeButton, pressed && !isSubmitting && styles.storeButtonPressed, isSubmitting && styles.storeButtonBusy]}
          >
            {isSubmitting ? <ActivityIndicator color={colors.surface} size="small" /> : <Text style={styles.storeButtonText}>Store</Text>}
          </Pressable>
        </View>
        <Feedback feedback={feedback} onRetry={handleStore} />
        <View accessible accessibilityLabel={`Automatic topic: ${automaticTopic}`} style={styles.automaticTopic}>
          <Text style={styles.automaticTopicLabel}>AUTOMATIC TOPIC</Text>
          <Text style={styles.automaticTopicText}>{automaticTopic}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  wordmark: { marginBottom: 26 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.15, marginBottom: 8 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.65, lineHeight: 36 },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  queue: { gap: 10, marginTop: 22 },
  queueRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', minHeight: 76, paddingHorizontal: 13, paddingVertical: 11 },
  queueIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 11, height: 40, justifyContent: 'center', marginRight: 11, width: 40 },
  queueIconReady: { backgroundColor: '#DDF8E5' },
  queueDetails: { flex: 1, minWidth: 0, paddingRight: 8 },
  queueTitle: { color: colors.text, fontSize: 14, fontWeight: '700', letterSpacing: -0.15 },
  queueTopic: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  progressTrack: { backgroundColor: colors.primarySoft, borderRadius: 99, height: 4, marginTop: 7, overflow: 'hidden', width: '100%' },
  progressFill: { backgroundColor: colors.primary, borderRadius: 99, height: '100%' },
  statusBadge: { alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: 8, flexDirection: 'row', gap: 4, justifyContent: 'center', paddingVertical: 5, width: 88 },
  statusBadgeProcessing: { backgroundColor: colors.primarySoft },
  statusBadgeReady: { backgroundColor: '#DDF8E5' },
  statusText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  statusTextProcessing: { color: colors.primaryDark },
  statusTextReady: { color: colors.success },
  saveSection: { marginTop: 24 },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  inputRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, flex: 1, fontSize: 15, minHeight: 52, minWidth: 0, paddingHorizontal: 13 },
  storeButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', minHeight: 52, paddingHorizontal: 16 },
  storeButtonPressed: { backgroundColor: colors.primaryDark },
  storeButtonBusy: { backgroundColor: colors.primaryDark },
  storeButtonText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  feedback: { alignItems: 'flex-start', borderRadius: 10, marginTop: 8, paddingHorizontal: 11, paddingVertical: 9 },
  feedbackError: { backgroundColor: '#FDE8E8' },
  feedbackWarning: { backgroundColor: '#FFF5D9' },
  feedbackSuccess: { backgroundColor: '#E7F8EC' },
  feedbackText: { color: colors.info, fontSize: 13, lineHeight: 18 },
  feedbackTextError: { color: colors.error },
  feedbackTextWarning: { color: '#A16207' },
  feedbackTextSuccess: { color: '#15803D' },
  retryButton: { marginTop: 5, minHeight: 28, paddingVertical: 3 },
  retryButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  automaticTopic: { alignItems: 'center', flexDirection: 'row', marginTop: 14 },
  automaticTopicLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.9 },
  automaticTopicText: { color: colors.muted, fontSize: 12, marginLeft: 8 },
});
