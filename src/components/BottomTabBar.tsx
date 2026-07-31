import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { ThemeColors, Spacing, Shadow, Fonts, FontSize } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface TabItem {
  icon: string;
  label: string;
  route: string;
}

interface BottomTabBarProps {
  activeRoute: string;
  onTabPress: (route: string) => void;
  isAgent?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeRoute,
  onTabPress,
  isAgent = false,
}) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);

  const userTabs: TabItem[] = [
    { icon: '⌂', label: t.tab_home, route: 'home' },
    { icon: '▣', label: t.tab_orders, route: 'orders' },
    { icon: '◉', label: t.tab_chat, route: 'chat' },
    { icon: '◌', label: t.tab_profile, route: 'profile' },
  ];

  const courierTabs: TabItem[] = [
    { icon: '⌂', label: t.tab_home, route: 'home' },
    { icon: '▣', label: t.tab_orders, route: 'orders' },
    { icon: '◉', label: t.tab_chat, route: 'chat' },
    { icon: '◌', label: t.tab_profile, route: 'profile' },
  ];

  const tabs = isAgent ? courierTabs : userTabs;

  return (
    <View style={styles.container}>
      <View style={[styles.bar, Shadow.fab]}>
        {tabs.map((tab, index) => {
          const isActive = activeRoute === tab.route;
          return (
            <React.Fragment key={tab.route}>
              {index === 2 && !isAgent ? <View style={styles.fabPlaceholder} /> : null}
              <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {!isAgent ? (
        <View style={styles.fabWrap}>
          <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => onTabPress('new-order')}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (C: ThemeColors, _isRTL: boolean) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: '100%',
    opacity: 0.97,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: { color: C.primary, fontFamily: Fonts.tajawal.bold },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  fabPlaceholder: { width: 68 },
  fabWrap: { position: 'absolute', bottom: 24, alignSelf: 'center' },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.fab,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
