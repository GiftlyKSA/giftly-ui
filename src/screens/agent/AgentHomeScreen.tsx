import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppHeader } from '../../components/AppHeader';
import { OrderCard } from '../../components/OrderCard';
import { BottomTabBar } from '../../components/BottomTabBar';

interface AgentHomeScreenProps {
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

const WEEK_DATES = [9, 10, 11, 12, 13, 14, 15];
const BAR_DATA = [65, 80, 45, 90, 55, 75, 60];

const StatCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  bg: string;
  isRTL: boolean;
  textColor?: string;
  subColor?: string;
}> = ({
  icon, label, value, bg, isRTL, textColor = '#000000', subColor,
}) => (
  <View style={[statCardStyle.card, { backgroundColor: bg }]}>
    <Ionicons name={icon} size={20} color={textColor} />
    <Text style={[statCardStyle.value, { color: textColor, textAlign: isRTL ? 'right' : 'left' }]}>{value}</Text>
    <Text style={[statCardStyle.label, { color: subColor ?? textColor, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
  </View>
);

const statCardStyle = StyleSheet.create({
  card: {
    flex: 1, borderRadius: Radius.xl, padding: Spacing.base,
    minHeight: 108, justifyContent: 'space-between', margin: 4,
  },
  value: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xl },
  label: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs },
});

export const AgentHomeScreen: React.FC<AgentHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
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

        <View style={styles.section}>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalValue}>6,000 ر.س</Text>
              <Text style={styles.goalLabel}>{t.agent_goal}</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '83%' }]} />
            </View>
            <Text style={styles.goalSub}>{t.agent_goal_sub}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.agent_schedule}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t.agent_full_cal}</Text></TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {t.days.map((day, idx) => (
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.sm }]}>{t.agent_perf}</Text>
          <View style={styles.statsRow}>
            <StatCard icon="checkmark-circle-outline" label={t.agent_completed} value="30"
              bg={C.primaryLighter} isRTL={isRTL} textColor={C.primary} subColor={C.textSecondary} />
            <StatCard icon="clipboard-outline" label={t.agent_active_orders} value="10"
              bg={C.primaryLight} isRTL={isRTL} textColor="#FFFFFF" subColor="rgba(255,255,255,0.8)" />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="cash-outline" label={t.agent_earnings} value="4,980 ر.س"
              bg={C.primaryButton} isRTL={isRTL} textColor="#FFFFFF" subColor="rgba(255,255,255,0.8)" />
            <StatCard icon="time-outline" label={t.agent_pending} value="5"
              bg={C.primaryLighter} isRTL={isRTL} textColor={C.black} subColor={C.textSecondary} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.chartCard, Shadow.card]}>
            <Text style={styles.chartTitle}>{t.agent_chart}</Text>
            <View style={styles.barChart}>
              {BAR_DATA.map((val, idx) => (
                <View key={idx} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (val / maxBar) * 120,
                          backgroundColor: activeDay === idx ? C.primary : C.primaryLight,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{t.days[idx]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.agent_recent}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t.agent_see_all}</Text></TouchableOpacity>
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

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
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
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
  },
  seeAll: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  goalCard: {
    backgroundColor: C.primaryLighter,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  goalLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
  goalValue: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.primary,
  },
  progressBg: {
    height: 6, borderRadius: 70,
    backgroundColor: C.gray200,
    marginBottom: Spacing.sm,
    transform: [{ scaleX: isRTL ? -1 : 1 }],
  },
  progressFill: {
    height: 6, borderRadius: 70,
    backgroundColor: C.primary,
  },
  goalSub: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    textAlign: isRTL ? 'right' : 'left',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.gray100,
    borderRadius: Radius.xl,
    padding: Spacing.xs,
  },
  dayCol: {
    flex: 1, alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  dayColActive: { backgroundColor: C.primaryButton },
  dayLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    marginBottom: 2,
  },
  dayLabelActive: { color: '#FFFFFF' },
  dayNum: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.black,
  },
  dayNumActive: { color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', marginBottom: 0 },
  chartCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
  },
  chartTitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
    textAlign: isRTL ? 'right' : 'left',
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
    color: C.textSecondary,
    marginTop: 4,
  },
});
