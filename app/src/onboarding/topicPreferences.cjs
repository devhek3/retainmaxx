const {
  hasMinimumTopicSelection,
  normalizeTopicSelection,
} = require('./topicCatalog.cjs');

const ONBOARDING_STORAGE_KEY = '@retainmaxx/onboarding-preferences';
const ONBOARDING_VERSION = 1;

function createOnboardingPreferences(selectedTopics) {
  const normalizedTopics = normalizeTopicSelection(selectedTopics);

  if (!hasMinimumTopicSelection(normalizedTopics)) {
    throw new RangeError('Select at least five topics before completing onboarding.');
  }

  return {
    version: ONBOARDING_VERSION,
    completed: true,
    selectedTopics: normalizedTopics,
  };
}

function parseOnboardingPreferences(value) {
  try {
    const parsed = JSON.parse(value);

    if (!parsed || parsed.version !== ONBOARDING_VERSION || parsed.completed !== true) {
      return null;
    }

    return createOnboardingPreferences(parsed.selectedTopics);
  } catch {
    return null;
  }
}

async function loadOnboardingPreferences(storage) {
  const storedValue = await storage.getItem(ONBOARDING_STORAGE_KEY);
  return storedValue ? parseOnboardingPreferences(storedValue) : null;
}

async function saveOnboardingPreferences(storage, selectedTopics) {
  const preferences = createOnboardingPreferences(selectedTopics);
  await storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(preferences));
  return preferences;
}

module.exports = {
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_VERSION,
  createOnboardingPreferences,
  loadOnboardingPreferences,
  parseOnboardingPreferences,
  saveOnboardingPreferences,
};
