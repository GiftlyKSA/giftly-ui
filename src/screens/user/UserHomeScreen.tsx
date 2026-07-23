import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppHeader } from '../../components/AppHeader';
import { OrderCard } from '../../components/OrderCard';
import { BottomTabBar } from '../../components/BottomTabBar';

interface UserHomeScreenProps {
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

const WEEK_DATES = [9, 10, 11, 12, 13, 14, 15];

const ORDERS = [
  { id: 'ORD-593821', eventName: 'يوم ميلاد', status: 'preparing' as const, time: '12.00 - 16.00', messageCount: 20 },
  { id: 'ORD-593822', eventName: 'يوم تخرج', status: 'delivering' as const, time: '10.00 - 14.00', messageCount: 5 },
];

const GiftCard: React.FC<{ title: string; price: string; tag: string }> = ({ title, price, tag }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createGiftCardStyles(C, isRTL), [C, isRTL]);
  return (
    <View style={styles.card}>
      <View style={styles.img}>
        <Text style={styles.imgEmoji}>🎁</Text>
      </View>
      <View style={styles.tagWrap}>
        <Text style={styles.tag}>{tag}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.price}>{price}{t.gift_currency}</Text>
    </View>
  );
};

const createGiftCardStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    marginLeft: isRTL ? Spacing.base : 0,
    marginRight: isRTL ? 0 : Spacing.base,
    padding: Spacing.sm,
    ...Shadow.card,
  },
  img: {
    height: 120, borderRadius: Radius.lg,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  imgEmoji: { fontSize: 48 },
  tagWrap: {
    backgroundColor: C.primaryLighter,
    borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 4,
  },
  tag: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xs, color: C.primary },
  title: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.black,
    textAlign: 'left',
    marginBottom: 4,
  },
  price: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.primary,
    textAlign: 'left',
  },
});

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <AppHeader userName="محمد" balance="9536" onProfilePress={() => {}} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>{t.home_hero}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home_featured}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t.home_see_all}</Text></TouchableOpacity>
          </View>
          <FlatList
            horizontal
            inverted={isRTL}
            data={t.gifts}
            renderItem={({ item }) => <GiftCard {...item} />}
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={isRTL ? { paddingRight: Spacing.xl } : { paddingLeft: Spacing.xl }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home_upcoming}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t.home_full_cal}</Text></TouchableOpacity>
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
          {t.upcoming_events.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.prepBtn}>
                <Text style={styles.prepBtnText}>{t.home_prepare}</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventTimeRow}>
                  <Text style={styles.eventDate}>⏰ {event.date}</Text>
                  <Text style={styles.eventDays}> {t.days_left(event.daysLeft)}</Text>
                </View>
              </View>
              <View style={styles.eventIconWrap}>
                <Text style={styles.eventIcon}>{event.icon}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={[styles.ordersCard, Shadow.card]}>
            <Text style={styles.ordersTitle}>{t.home_orders}</Text>
            {ORDERS.map(order => (
              <OrderCard
                key={order.id}
                orderId={order.id}
                eventName={order.eventName}
                status={order.status}
                time={order.time}
                messageCount={order.messageCount}
                onPress={() => onOrderPress(order.id)}
                onViewDetails={() => onOrderPress(order.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeRoute={activeTab} onTabPress={handleTab} isAgent={false} />
    </View>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  scroll: { flex: 1 },
  heroSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  heroText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xxxl,
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
    lineHeight: 36,
  },
  section: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
  sectionHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.black,
  },
  seeAll: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.gray100,
    borderRadius: Radius.xl,
    padding: Spacing.xs,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  dayColActive: { backgroundColor: C.primary },
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
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: C.primary,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  eventIconWrap: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
  },
  eventIcon: { fontSize: 20 },
  eventContent: { flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' },
  eventTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
  },
  eventTimeRow: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 4 },
  eventDate: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.xs,
    color: C.gray500,
  },
  eventDays: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.primary,
  },
  prepBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  prepBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
  ordersCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
  },
  ordersTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.primary,
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: Spacing.base,
  },
});
