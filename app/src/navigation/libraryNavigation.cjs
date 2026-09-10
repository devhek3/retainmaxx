const LIBRARY_SCREENS = Object.freeze({
  ALL: 'all',
  DETAIL: 'detail',
  LIBRARY: 'library',
});

const initialLibraryNavigationState = Object.freeze({
  returnScreen: LIBRARY_SCREENS.LIBRARY,
  screen: LIBRARY_SCREENS.LIBRARY,
  selectedVideoId: null,
});

function libraryNavigationReducer(state, action) {
  switch (action.type) {
    case 'OPEN_ALL':
      return {
        returnScreen: LIBRARY_SCREENS.LIBRARY,
        screen: LIBRARY_SCREENS.ALL,
        selectedVideoId: null,
      };
    case 'OPEN_VIDEO':
      return {
        returnScreen: state.screen === LIBRARY_SCREENS.ALL
          ? LIBRARY_SCREENS.ALL
          : LIBRARY_SCREENS.LIBRARY,
        screen: LIBRARY_SCREENS.DETAIL,
        selectedVideoId: action.videoId,
      };
    case 'BACK':
      if (state.screen === LIBRARY_SCREENS.DETAIL) {
        return {
          returnScreen: LIBRARY_SCREENS.LIBRARY,
          screen: state.returnScreen,
          selectedVideoId: null,
        };
      }

      return initialLibraryNavigationState;
    case 'RESET':
      return initialLibraryNavigationState;
    default:
      return state;
  }
}

module.exports = {
  LIBRARY_SCREENS,
  initialLibraryNavigationState,
  libraryNavigationReducer,
};
