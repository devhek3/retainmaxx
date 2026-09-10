const test = require('node:test');
const assert = require('node:assert/strict');

const {
  LIBRARY_SCREENS,
  initialLibraryNavigationState,
  libraryNavigationReducer,
} = require('../src/navigation/libraryNavigation.cjs');

function reduce(state, type, videoId) {
  return libraryNavigationReducer(state, { type, videoId });
}

test('a Library row opens a detail and back clears the selection', () => {
  const detail = reduce(initialLibraryNavigationState, 'OPEN_VIDEO', 'consistency');

  assert.deepEqual(detail, {
    returnScreen: LIBRARY_SCREENS.LIBRARY,
    screen: LIBRARY_SCREENS.DETAIL,
    selectedVideoId: 'consistency',
  });
  assert.deepEqual(reduce(detail, 'BACK'), initialLibraryNavigationState);
});

test('a See All row returns from detail to the full collection', () => {
  const all = reduce(initialLibraryNavigationState, 'OPEN_ALL');
  const detail = reduce(all, 'OPEN_VIDEO', 'ai-tools');
  const returnedToAll = reduce(detail, 'BACK');

  assert.equal(returnedToAll.screen, LIBRARY_SCREENS.ALL);
  assert.equal(returnedToAll.selectedVideoId, null);
  assert.deepEqual(reduce(returnedToAll, 'BACK'), initialLibraryNavigationState);
});

test('repeated navigation never retains a previously selected video', () => {
  const firstDetail = reduce(initialLibraryNavigationState, 'OPEN_VIDEO', 'consistency');
  const library = reduce(firstDetail, 'BACK');
  const all = reduce(library, 'OPEN_ALL');
  const secondDetail = reduce(all, 'OPEN_VIDEO', 'small-habits');

  assert.equal(secondDetail.selectedVideoId, 'small-habits');
  assert.equal(secondDetail.returnScreen, LIBRARY_SCREENS.ALL);
  assert.equal(reduce(secondDetail, 'BACK').selectedVideoId, null);
  assert.deepEqual(reduce(secondDetail, 'RESET'), initialLibraryNavigationState);
});
