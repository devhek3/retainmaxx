import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

const tabs = [
  { key: 'saveVideo', label: 'Save video', icon: '↓' },
  { key: 'topics', label: 'My topics', icon: '#' },
  { key: 'account', label: 'My account', icon: '◉' },
];

export default function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onTabChange(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Text style={[styles.icon, isActive && styles.activeText]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 68,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  icon: {
    color: colors.muted,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 22,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: colors.primary,
  },
});
