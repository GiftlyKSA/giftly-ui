import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { AppHeader } from '../../components/AppHeader';
import { OrderCard } from '../../components/OrderCard';
import { BottomTabBar } from '../../components/BottomTabBar';

I18nManager.forceRTL(true);

interface AgentHomeScreenProps {
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

const WEEK_DAYS = ['الأح', 'الإث', 'الثل', 'الأر', 'الخم', 'الجم', 'الس'];
const WEEK_DATES = [9, 10, 11, 12, 13, 14, 15];
const BAR_DATA = [65, 80, 45, 90, 55, 75, 60];

const StatCard: React.FC<{ icon: string; label: string; value: string; bg: string; textColor?: string }> = ({
  icon, label, value, bg, textColor = Colors.black,
}) => (
  <View style={[statStyles.card, { backgroundColor: bg }]}>
    <Text style={statStyles.icon}>{icon}</Text>
    <Text style={[statStyles.value, { color: textColor }]}>{value}</Text>
    <Text style={[statStyles.label, { color: textColor === Colors.white ? 'rgba(255,255,255,0.8)' : Colors.textSecondary }]}>
      {label}
    </Text>
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    minHeight: 108,
    justifyContent: 'space-between',
    margin: 4,
  },
  icon: { fontSize: 20 },
  value: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xl, textAlign: 'right' },
  label: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, textAlign: 'right' },
});

export const AgentHomeScreen: React.FC<AgentHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  const maxBar = Math.max(...BAR_DATA);

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <AppHeader userName="خبير الهدايا" isAgent rating={4} onProfilePress={() => {}} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Earnings goal progress */}
        <View style={styles.section}>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalValue}>6,000 ر.س</Text>
              <Text style={styles.goalLabel}>هدف الأرباح</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '83%' }]} />
            </View>
            <Text style={styles.goalSub}>لقد حققت 83% من هدفك هذا الشهر 🎯</Text>
          </View>
        </View>

        {/* Weekly Calendar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity><Text style={styles.seeAll}>التقويم الكامل</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>الجدول الأسبوعي</Text>
          </View>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dayCol, activeDay === idx && styles.dayColActive]}
                onPress={() => setActiveDay(idx)}
              >
                <Text style={[styles.dayLabel, activeDay === idx && styles.dayLabelActive]}>{day}</Text>
                <Text style={[styles.dayNum, activeDay === idx && styles.dayNumActive]}>{WEEK_DATES[idx]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: 'right', marginBottom: Spacing.sm }]}>ملخص الأداء</Text>
          <View style={styles.statsRow}>
            <StatCard icon="✅" label="طلبات مكتملة" value="30" bg={'rgba(103,49,149,0.1)'} />
            <StatCard icon="📋" label="طلبات نشطة" value="10" bg={Colors.primaryLight} textColor={Colors.white} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="💰" label="الأرباح هذا الشهر" value="4,980 ر.س" bg={Colors.primary} textColor={Colors.white} />
            <StatCard icon="📃" label="طلبات معلقة" value="5" bg={'rgba(201,174,236,0.3)'} />
          </View>
        </View>

        {/* Weekly Earnings Chart */}
        <View style={styles.section}>
          <View style={[styles.chartCard, Shadow.card]}>
            <Text style={styles.chartTitle}>إجمالي الأرباح / أسبوع</Text>
            <View style={styles.barChart}>
              {BAR_DATA.map((val, idx) => (
                <View key={idx} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (val / maxBar) * 120,
                          backgroundColor: activeDay === idx ? Colors.primary : Colors.primaryLight,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{WEEK_DAYS[idx]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity><Text style={styles.seeAll}>عرض الكل</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>الطلبات الحديثة</Text>
          </View>
          <OrderCard
            orderId="ORD-593821"
            eventName="يوم ميلاد"
            status="preparing"
            messageCount={20}
            onPress={() => onOrderPress('ORD-593821')}
            onViewDetails={() => onOrderPress('ORD-593821')}
          />
          <OrderCard
            orderId="ORD-593822"
            eventName="يوم تخرج"
            status="delivering"
            messageCount={5}
            onPress={() => onOrderPress('ORD-593822')}
            onViewDetails={() => onOrderPress('ORD-593822')}
          />
        </View>
      </ScrollView>

      <BottomTabBar activeRoute={activeTab} onTabPress={handleTab} isAgent />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  section: { marginBottom: Spacing.base, paddingHorizontal: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.black,
  },
  seeAll: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  goalCard: {
    backgroundColor: 'rgba(160,132,232,0.1)',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginTop: Spacing.base,
  },
  goalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  goalLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  goalValue: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: Colors.primary,
  },
  progressBg: {
    height: 6,
    borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 6,
    borderRadius: 70,
    backgroundColor: Colors.primary,
  },
  goalSub: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.xl,
    padding: Spacing.xs,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  dayColActive: { backgroundColor: Colors.primary },
  dayLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dayLabelActive: { color: Colors.white },
  dayNum: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: Colors.black,
  },
  dayNumActive: { color: Colors.white },
  statsRow: { flexDirection: 'row', marginBottom: 0 },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
  },
  chartTitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.base,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    justifyContent: 'space-between',
  },
  barCol: { flex: 1, alignItems: 'center' },
  barWrap: { height: 120, justifyContent: 'flex-end' },
  bar: { width: 20, borderRadius: Radius.md },
  barLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
