const MINIMUM_TOPIC_SELECTION = 5;

const TOPICS = Object.freeze([
  'AI & Machine Learning',
  'Personal Finance',
  'Investing',
  'Career Growth',
  'Entrepreneurship',
  'Marketing & Branding',
  'Sales & Negotiation',
  'Leadership & Management',
  'Productivity',
  'Communication',
  'Psychology',
  'Mental Health',
  'Relationships',
  'Parenting',
  'Nutrition',
  'Fitness',
  'Sleep & Recovery',
  'Cooking',
  'Travel',
  'Language Learning',
  'History',
  'Science',
  'Space',
  'Environment & Sustainability',
  'Technology',
  'Cybersecurity',
  'Software Development',
  'Design & Creativity',
  'Photography & Video',
  'Music',
  'Books & Writing',
  'Fashion & Style',
  'Home & Organization',
  'Gardening',
  'DIY & Repair',
  'Cars & Transportation',
  'Sports',
  'Gaming',
  'News & Current Events',
  'Law & Civics',
  'Education & Study Skills',
  'Mathematics',
  'Art & Culture',
  'Spirituality & Mindfulness',
  'Pets & Animals',
]);

function normalizeTopicSelection(selection) {
  if (!Array.isArray(selection)) {
    return [];
  }

  return [...new Set(selection)].filter((topic) => TOPICS.includes(topic));
}

function hasMinimumTopicSelection(selection) {
  return normalizeTopicSelection(selection).length >= MINIMUM_TOPIC_SELECTION;
}

module.exports = {
  MINIMUM_TOPIC_SELECTION,
  TOPICS,
  hasMinimumTopicSelection,
  normalizeTopicSelection,
};
