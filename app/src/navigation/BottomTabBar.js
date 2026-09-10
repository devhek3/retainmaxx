import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Clock3, Grid2X2, House } from 'lucide-react-native';

import { colors } from '../theme/colors';

const tabs = [
  { key: 'saveVideo', label: 'Library', Icon: House },
  { key: 'topics', label: 'Topics', Icon: Grid2X2 },
  { key: 'account', label: 'Review', Icon: Clock3 },
];

export default function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {tabs.map(({ key, label, Icon }) => {
        const isActive = key === activeTab;
        const iconColor = isActive ? colors.primary : '#7D8595';

        return (
          <Pressable
            key={key}
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabChange(key)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Icon
              accessible={false}
              color={iconColor}
              fill={isActive && key !== 'account' ? iconColor : 'none'}
              size={24}
              strokeWidth={2.2}
            />
            <Text style={[styles.label, isActive && styles.activeText]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopColor: '#ECECF0',
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 74,
    paddingBottom: 9,
    paddingHorizontal: 18,
    paddingTop: 9,
  },
  tab: { alignItems: 'center', borderRadius: 12, flex: 1, gap: 4, justifyContent: 'center' },
  pressed: { backgroundColor: colors.primarySoft },
  label: { color: '#737987', fontSize: 12, fontWeight: '500' },
  activeText: { color: colors.primary },
});
