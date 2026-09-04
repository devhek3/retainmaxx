const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MINIMUM_TOPIC_SELECTION,
  TOPICS,
  hasMinimumTopicSelection,
} = require('../src/onboarding/topicCatalog.cjs');
const {
  ONBOARDING_STORAGE_KEY,
  loadOnboardingPreferences,
  saveOnboardingPreferences,
} = require('../src/onboarding/topicPreferences.cjs');

function createMemoryStorage(initialValue = null) {
  const values = new Map(initialValue ? [[ONBOARDING_STORAGE_KEY, initialValue]] : []);

  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => values.set(key, value),
  };
}

test('the catalogue contains exactly 45 distinct topics across the MVP domains', () => {
  assert.equal(TOPICS.length, 45);
  assert.equal(new Set(TOPICS).size, 45);
  assert.deepEqual(TOPICS.slice(0, 5), ['AI & Machine Learning', 'Personal Finance', 'Investing', 'Career Growth', 'Entrepreneurship']);
});

test('a selection must contain at least five catalogue topics', () => {
  assert.equal(hasMinimumTopicSelection(TOPICS.slice(0, MINIMUM_TOPIC_SELECTION - 1)), false);
  assert.equal(hasMinimumTopicSelection(TOPICS.slice(0, MINIMUM_TOPIC_SELECTION)), true);
  assert.equal(hasMinimumTopicSelection(['Not a catalogue topic', ...TOPICS.slice(0, 4)]), false);
});

test('saving valid selections marks onboarding complete and restores them after a relaunch', async () => {
  const storage = createMemoryStorage();
  const selectedTopics = TOPICS.slice(0, MINIMUM_TOPIC_SELECTION + 1);

  const saved = await saveOnboardingPreferences(storage, selectedTopics);
  const restored = await loadOnboardingPreferences(storage);

  assert.equal(saved.completed, true);
  assert.deepEqual(restored, saved);
});

test('invalid or incomplete stored onboarding data returns to onboarding', async () => {
  const storage = createMemoryStorage(JSON.stringify({ version: 1, completed: true, selectedTopics: TOPICS.slice(0, 4) }));

  assert.equal(await loadOnboardingPreferences(storage), null);
  await assert.rejects(() => saveOnboardingPreferences(storage, TOPICS.slice(0, 4)), RangeError);
});
