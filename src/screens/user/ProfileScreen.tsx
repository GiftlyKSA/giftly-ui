import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';

I18nManager.forceRTL(true);

interface ProfileScreenProps {
  isAgent?: boolean;
  onBack?: () => void;
  onLogout: () => void;
}

const MenuItem: React.FC<{ icon: string; label: string; onPress?: () => void; value?: string; danger?: boolean }> = ({
  icon, label, onPress, value, danger = false,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.menuArrow, danger && { color: Colors.error }]}>‹</Text>
    {value && <Text style={styles.menuValue}>{value}</Text>}
    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
    <View style={[styles.menuIconWrap, danger && { backgroundColor: 'rgba(219,13,13,0.1)' }]}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
  </TouchableOpacity>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ isAgent = false, onBack, onLogout }) => {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, Shadow.header]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>→</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>✏️ تعديل</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{isAgent ? '🎁' : '👤'}</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{isAgent ? 'أحمد محمد - خبير الهدايا' : 'محمد أحمد'}</Text>
          <Text style={styles.userPhone}>+966 05xxxxxxxx</Text>
          {isAgent && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingCount}>(48 تقييم)</Text>
              <Text style={styles.ratingStars}>★★★★☆  4.2</Text>
            </View>
          )}
          {isAgent && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>130</Text>
                <Text style={styles.statLabel}>طلب مكتمل</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4,980</Text>
                <Text style={styles.statLabel}>ر.س أرباح</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>رضا العملاء</Text>
              </View>
            </View>
          )}
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الحساب</Text>
          <View style={styles.card}>
            <MenuItem icon="📧" label="البريد الإلكتروني" value="example@email.com" />
            <View style={styles.divider} />
            <MenuItem icon="🏠" label="العنوان" value="الرياض، السعودية" />
            <View style={styles.divider} />
            <MenuItem icon="💳" label="طرق الدفع" />
            {isAgent && (
              <>
                <View style={styles.divider} />
                <MenuItem icon="📊" label="تقرير الأداء" />
                <View style={styles.divider} />
                <MenuItem icon="🗓️" label="الجدول الشهري" />
              </>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التفضيلات</Text>
          <View style={styles.card}>
            <View style={styles.toggleItem}>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ true: Colors.primary }}
                thumbColor={Colors.white}
              />
              <View style={styles.toggleText}>
                <Text style={styles.menuLabel}>الإشعارات</Text>
                <View style={styles.menuIconWrap}>
                  <Text style={styles.menuIcon}>🔔</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleItem}>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ true: Colors.primary }}
                thumbColor={Colors.white}
              />
              <View style={styles.toggleText}>
                <Text style={styles.menuLabel}>الوضع الداكن</Text>
                <View style={styles.menuIconWrap}>
                  <Text style={styles.menuIcon}>🌙</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <MenuItem icon="🌐" label="اللغة" value="العربية" />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الدعم</Text>
          <View style={styles.card}>
            <MenuItem icon="❓" label="مركز المساعدة" />
            <View style={styles.divider} />
            <MenuItem icon="📜" label="الشروط والأحكام" />
            <View style={styles.divider} />
            <MenuItem icon="🔒" label="سياسة الخصوصية" />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem icon="🚪" label="تسجيل الخروج" onPress={onLogout} danger />
            <View style={styles.divider} />
            <MenuItem icon="🗑️" label="حذف الحساب" danger />
          </View>
        </View>

        <Text style={styles.version}>الإصدار 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPage },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 20, color: Colors.primary },
  headerTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: Colors.black,
  },
  editBtn: { padding: Spacing.sm },
  editText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  scroll: { paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    marginBottom: Spacing.base,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.base },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarEmoji: { fontSize: 42 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: { fontSize: 14 },
  userName: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: Colors.black,
    marginBottom: 4,
  },
  userPhone: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  ratingStars: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: '#FFB800',
  },
  ratingCount: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: { width: 1, backgroundColor: Colors.gray200 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base },
  sectionTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 16 },
  menuLabel: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'right',
  },
  menuValue: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.gray400,
    fontWeight: '300',
  },
  divider: { height: 1, backgroundColor: Colors.gray100, marginHorizontal: Spacing.base },
  toggleItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  toggleText: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  version: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.sm,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
});
