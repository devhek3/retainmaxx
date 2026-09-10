import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Clock3, House, LayoutGrid } from 'lucide-react-native';

import { colors } from '../theme/colors';

const tabs = [
  { key: 'saveVideo', label: 'Library', Icon: House },
  { key: 'topics', label: 'Topics', Icon: LayoutGrid },
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
              fill={isActive && key === 'topics' ? iconColor : 'none'}
              size={25}
              strokeWidth={2}
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 9,
  },
  tab: { alignItems: 'center', borderRadius: 12, flex: 1, gap: 5, justifyContent: 'center' },
  pressed: { backgroundColor: colors.primarySoft },
  label: { color: '#7D8595', fontSize: 12, fontWeight: '600' },
  activeText: { color: colors.primary },
});
