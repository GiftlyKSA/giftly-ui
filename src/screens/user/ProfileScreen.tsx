import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, I18nManager,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';

I18nManager.forceRTL(true);

interface ProfileScreenProps {
  isAgent?: boolean;
  onBack?: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ isAgent = false, onBack, onLogout }) => {
  const { C, isDark, toggle } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const topPadding = useTopInset();

  const [notifEnabled, setNotifEnabled] = React.useState(true);

  return (
    <View style={styles.root}>
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الحساب</Text>
          <View style={styles.card}>
            <MenuItem C={C} icon="📧" label="البريد الإلكتروني" value="example@email.com" />
            <View style={styles.divider} />
            <MenuItem C={C} icon="🏠" label="العنوان" value="الرياض، السعودية" />
            <View style={styles.divider} />
            <MenuItem C={C} icon="💳" label="طرق الدفع" />
            {isAgent && (
              <>
                <View style={styles.divider} />
                <MenuItem C={C} icon="📊" label="تقرير الأداء" />
                <View style={styles.divider} />
                <MenuItem C={C} icon="🗓️" label="الجدول الشهري" />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التفضيلات</Text>
          <View style={styles.card}>
            <View style={styles.toggleItem}>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ true: C.primary }}
                thumbColor={C.white}
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
                value={isDark}
                onValueChange={toggle}
                trackColor={{ true: C.primary }}
                thumbColor={C.white}
              />
              <View style={styles.toggleText}>
                <Text style={styles.menuLabel}>الوضع الداكن</Text>
                <View style={styles.menuIconWrap}>
                  <Text style={styles.menuIcon}>🌙</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <MenuItem C={C} icon="🌐" label="اللغة" value="العربية" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الدعم</Text>
          <View style={styles.card}>
            <MenuItem C={C} icon="❓" label="مركز المساعدة" />
            <View style={styles.divider} />
            <MenuItem C={C} icon="📜" label="الشروط والأحكام" />
            <View style={styles.divider} />
            <MenuItem C={C} icon="🔒" label="سياسة الخصوصية" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem C={C} icon="🚪" label="تسجيل الخروج" onPress={onLogout} danger />
            <View style={styles.divider} />
            <MenuItem C={C} icon="🗑️" label="حذف الحساب" danger />
          </View>
        </View>

        <Text style={styles.version}>الإصدار 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const MenuItem: React.FC<{
  C: ThemeColors;
  icon: string;
  label: string;
  onPress?: () => void;
  value?: string;
  danger?: boolean;
}> = ({ C, icon, label, onPress, value, danger = false }) => {
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.menuArrow, danger && { color: C.error }]}>‹</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <Text style={[styles.menuLabel, danger && { color: C.error }]}>{label}</Text>
      <View style={[styles.menuIconWrap, danger && { backgroundColor: 'rgba(219,13,13,0.1)' }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 20, color: C.primary },
  headerTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.black,
  },
  editBtn: { padding: Spacing.sm },
  editText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.primary,
  },
  scroll: { paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: C.white,
    marginBottom: Spacing.base,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.base },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: C.primaryLight,
  },
  avatarEmoji: { fontSize: 42 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraIcon: { fontSize: 14 },
  userName: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.black,
    marginBottom: 4,
  },
  userPhone: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
    marginBottom: Spacing.sm,
  },
  ratingRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  ratingStars: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: '#FFB800' },
  ratingCount: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  statsRow: {
    flexDirection: 'row-reverse',
    backgroundColor: C.gray100,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.primary },
  statLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    textAlign: 'center',
  },
  statDivider: { width: 1, backgroundColor: C.gray200 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base },
  sectionTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: C.white,
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
    width: 34, height: 34, borderRadius: Radius.md,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 16 },
  menuLabel: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
  },
  menuValue: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  menuArrow: { fontSize: 20, color: C.gray400, fontWeight: '300' },
  divider: { height: 1, backgroundColor: C.gray100, marginHorizontal: Spacing.base },
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
    color: C.gray500,
    textAlign: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
});
