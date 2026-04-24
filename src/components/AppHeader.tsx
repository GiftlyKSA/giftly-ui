import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Colors, Spacing, Radius, Shadow, Fonts, FontSize } from '../constants/colors';

interface AppHeaderProps {
  userName: string;
  balance?: string;
  isAgent?: boolean;
  rating?: number;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName,
  balance,
  isAgent = false,
  rating,
  onProfilePress,
  onNotificationPress,
}) => {
  return (
    <View style={[styles.header, Shadow.header]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Left: balance or analytics icon */}
      <View style={styles.left}>
        {isAgent ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
            <Text style={styles.iconText}>📊</Text>
          </TouchableOpacity>
        ) : balance !== undefined ? (
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceCurrency}> ر.س</Text>
          </View>
        ) : null}
      </View>

      {/* Right: Avatar + Name */}
      <TouchableOpacity style={styles.profileRow} onPress={onProfilePress}>
        <View style={styles.textCol}>
          <Text style={styles.greeting}>اهلاً، {userName}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  left: { alignItems: 'flex-start' },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceAmount: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: 22,
    color: Colors.primary,
  },
  balanceCurrency: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  profileRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  textCol: { alignItems: 'flex-end' },
  greeting: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'right',
  },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  star: { fontSize: 10, color: Colors.gray300 },
  starFilled: { color: '#FFB800' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: Colors.primary,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(209,209,214,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
});
