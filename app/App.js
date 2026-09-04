import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import BottomTabBar from './src/navigation/BottomTabBar';
import MyAccountScreen from './src/screens/MyAccountScreen';
import MyTopicsScreen from './src/screens/MyTopicsScreen';
import SaveVideoScreen from './src/screens/SaveVideoScreen';
import { colors } from './src/theme/colors';

const screens = {
  saveVideo: SaveVideoScreen,
  topics: MyTopicsScreen,
  account: MyAccountScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('saveVideo');
  const ActiveScreen = screens[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <ActiveScreen />
      </View>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
});
