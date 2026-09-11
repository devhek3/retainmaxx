import { useEffect, useReducer, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import BottomTabBar from './src/navigation/BottomTabBar';
import AllSavesScreen from './src/screens/AllSavesScreen';
import MyTopicsScreen from './src/screens/MyTopicsScreen';
import OnboardingTopicsScreen from './src/screens/OnboardingTopicsScreen';
import ReelDetailScreen from './src/screens/ReelDetailScreen';
import SaveVideoScreen from './src/screens/SaveVideoScreen';
import {
  initialLibraryNavigationState,
  LIBRARY_SCREENS,
  libraryNavigationReducer,
} from './src/navigation/libraryNavigation.cjs';
import {
  loadOnboardingPreferences,
  saveOnboardingPreferences,
} from './src/onboarding/topicPreferences.cjs';
import { colors } from './src/theme/colors';
import { SAVED_VIDEOS } from './src/videoQueue/savedVideos';

const screens = {
  saveVideo: SaveVideoScreen,
  topics: MyTopicsScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('saveVideo');
  const [libraryNavigation, navigateLibrary] = useReducer(
    libraryNavigationReducer,
    initialLibraryNavigationState,
  );
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const selectedVideo = SAVED_VIDEOS.find(({ id }) => id === libraryNavigation.selectedVideoId);
  const ActiveScreen = screens[activeTab];

  useEffect(() => {
    async function loadPreferences() {
      try {
        const preferences = await loadOnboardingPreferences(AsyncStorage);
        if (preferences) {
          setSelectedTopics(preferences.selectedTopics);
        }
      } finally {
        setHasLoadedPreferences(true);
      }
    }

    loadPreferences();
  }, []);

  function handleOnboardingComplete(topics) {
    setSelectedTopics(topics);
    setActiveTab('topics');
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    navigateLibrary({ type: 'RESET' });
  }

  if (!hasLoadedPreferences) {
    return (
      <SafeAreaView style={styles.loadingArea}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (selectedTopics.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <OnboardingTopicsScreen
          onComplete={handleOnboardingComplete}
          savePreferences={(topics) => saveOnboardingPreferences(AsyncStorage, topics)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        {activeTab === 'saveVideo' && libraryNavigation.screen === LIBRARY_SCREENS.ALL ? (
          <AllSavesScreen
            onBack={() => navigateLibrary({ type: 'BACK' })}
            onSelectVideo={({ id }) => navigateLibrary({ type: 'OPEN_VIDEO', videoId: id })}
          />
        ) : null}
        {activeTab === 'saveVideo' && libraryNavigation.screen === LIBRARY_SCREENS.DETAIL && selectedVideo ? (
          <ReelDetailScreen
            onBack={() => navigateLibrary({ type: 'BACK' })}
            video={selectedVideo}
          />
        ) : null}
        {activeTab !== 'saveVideo' || libraryNavigation.screen === LIBRARY_SCREENS.LIBRARY ? (
          <ActiveScreen
            onSelectVideo={({ id }) => navigateLibrary({ type: 'OPEN_VIDEO', videoId: id })}
            onViewAll={() => navigateLibrary({ type: 'OPEN_ALL' })}
            selectedTopics={selectedTopics}
          />
        ) : null}
      </View>
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingArea: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
});
