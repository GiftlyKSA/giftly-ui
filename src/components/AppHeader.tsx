import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors, Shadow, Spacing, Radius, Fonts, FontSize } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface AppHeaderProps {
  userName: string;
  balance?: string;
  isAgent?: boolean;
  rating?: number;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName, balance, isAgent = false, rating, onProfilePress, onNotificationPress,
}) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const { top } = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? top : (StatusBar.currentHeight ?? 0) + 4;
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);

  return (
    <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
      <StatusBar barStyle={C.black === '#000000' ? 'dark-content' : 'light-content'}
        backgroundColor={C.white} translucent={Platform.OS === 'android'} />

      <TouchableOpacity style={styles.profileRow} onPress={onProfilePress}>
         <View style={styles.textCol}>
          <Text style={styles.greeting}>{t.home_greeting}{userName}</Text>
          {isAgent && rating ? (
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <Text key={i} style={[styles.star, i <= Math.floor(rating) && styles.starFilled]}>★</Text>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.left}>
        {isAgent ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
            <Text style={styles.iconText}>📊</Text>
          </TouchableOpacity>
        ) : balance !== undefined ? (
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceCurrency}>{t.home_currency}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  header: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  left: { alignItems: isRTL ? 'flex-start' : 'flex-end' },
  balanceRow: { flexDirection: isRTL ? 'row' : 'row-reverse', alignItems: 'center' },
  balanceAmount: { fontFamily: Fonts.tajawal.bold, fontSize: 22, color: C.primary },
  balanceCurrency: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
  profileRow: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: Spacing.sm },
  textCol: { alignItems: isRTL ? 'flex-end' : 'flex-start' },
  greeting: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
  },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  star: { fontSize: 10, color: C.gray300 },
  starFilled: { color: '#FFB800' },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.primary },
  iconBtn: {
    width: 34, height: 34, borderRadius: Radius.md,
    backgroundColor: C.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
});
