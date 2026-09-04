import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import BottomTabBar from './src/navigation/BottomTabBar';
import MyAccountScreen from './src/screens/MyAccountScreen';
import MyTopicsScreen from './src/screens/MyTopicsScreen';
import OnboardingTopicsScreen from './src/screens/OnboardingTopicsScreen';
import SaveVideoScreen from './src/screens/SaveVideoScreen';
import {
  loadOnboardingPreferences,
  saveOnboardingPreferences,
} from './src/onboarding/topicPreferences.cjs';
import { colors } from './src/theme/colors';

const screens = {
  saveVideo: SaveVideoScreen,
  topics: MyTopicsScreen,
  account: MyAccountScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('saveVideo');
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
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
        <ActiveScreen selectedTopics={selectedTopics} />
      </View>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
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
