const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const APP_ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(APP_ROOT, relativePath), 'utf8');
}

test('Topics and Library omit search and recently active UI', () => {
  const topicsScreen = read('src/screens/MyTopicsScreen.js');
  const libraryScreen = read('src/screens/SaveVideoScreen.js');

  assert.doesNotMatch(topicsScreen, /\bSearch\b|Recently active topics|RecentTopics|RecentTopicCard/);
  assert.doesNotMatch(libraryScreen, /\bSearch\b|Search library|searchButton/);
});

test('topic cards retain two columns with expanded height and padding', () => {
  const topicsScreen = read('src/screens/MyTopicsScreen.js');

  assert.match(topicsScreen, /numColumns=\{2\}/);
  assert.match(topicsScreen, /topicCard: \{[^}]*height: 120[^}]*padding: 20/);
});

test('bottom navigation exposes only Library and Topics', () => {
  const bottomTabBar = read('src/navigation/BottomTabBar.js');
  const app = read('App.js');

  assert.match(bottomTabBar, /label: 'Library'/);
  assert.match(bottomTabBar, /label: 'Topics'/);
  assert.doesNotMatch(bottomTabBar, /label: 'Review'|Clock3|key: 'account'/);
  assert.doesNotMatch(app, /MyAccountScreen|account: MyAccountScreen/);
});
