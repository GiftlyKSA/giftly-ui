import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, I18nManager,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { AppHeader } from '../../components/AppHeader';
import { OrderCard } from '../../components/OrderCard';
import { BottomTabBar } from '../../components/BottomTabBar';

I18nManager.forceRTL(true);

interface UserHomeScreenProps {
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

const UPCOMING_EVENTS = [
  { id: '1', title: 'يوم ميلاد ......', date: '9 أبريل', daysLeft: 3, icon: '🎂' },
  { id: '2', title: 'يوم تخرج .......', date: '15 أبريل', daysLeft: 9, icon: '🎓' },
  { id: '3', title: 'يوم زواج .......', date: '22 أبريل', daysLeft: 16, icon: '💍' },
];

const ORDERS = [
  { id: 'ORD-593821', eventName: 'يوم ميلاد', status: 'preparing' as const, time: '12.00 - 16.00', messageCount: 20 },
  { id: 'ORD-593822', eventName: 'يوم تخرج', status: 'delivering' as const, time: '10.00 - 14.00', messageCount: 5 },
];

const WEEK_DAYS = ['الأح', 'الإث', 'الثل', 'الأر', 'الخم', 'الجم', 'الس'];
const WEEK_DATES = [9, 10, 11, 12, 13, 14, 15];

const GiftCard: React.FC<{ title: string; price: string; tag: string }> = ({ title, price, tag }) => {
  const { C } = useTheme();
  const styles = useMemo(() => createGiftCardStyles(C), [C]);
  return (
    <View style={styles.card}>
      <View style={styles.img}>
        <Text style={styles.imgEmoji}>🎁</Text>
      </View>
      <View style={styles.tagWrap}>
        <Text style={styles.tag}>{tag}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.price}>{price} ر.س</Text>
    </View>
  );
};

const createGiftCardStyles = (C: ThemeColors) => StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    marginLeft: Spacing.base,
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
    alignSelf: 'flex-end', marginBottom: 4,
  },
  tag: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xs, color: C.primary },
  title: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  price: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.primary,
    textAlign: 'right',
  },
});

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <AppHeader userName="محمد" balance="1,321" onProfilePress={() => {}} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>اختيارات{'\n'}تصنع لحظة لا تُنسى</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity><Text style={styles.seeAll}>عرض الكل</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>الهدايا المميزة</Text>
          </View>
          <FlatList
            horizontal
            inverted
            data={[
              { title: 'باقة ورد فاخرة', price: '250', tag: 'الأكثر طلباً' },
              { title: 'صندوق شوكولاتة بلجيكية', price: '180', tag: 'جديد' },
              { title: 'عطر فاخر', price: '450', tag: 'مميز' },
            ]}
            renderItem={({ item }) => <GiftCard {...item} />}
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: Spacing.xl }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity><Text style={styles.seeAll}>التقويم الكامل</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>مناسباتك القادمة</Text>
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

        <View style={styles.section}>
          {UPCOMING_EVENTS.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventLeft}>
                <View style={styles.prepBtn}>
                  <Text style={styles.prepBtnText}>جهّز هديتك</Text>
                </View>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventTimeRow}>
                  <Text style={styles.eventDate}>⏰ {event.date}</Text>
                  <Text style={styles.eventDays}> · بعد {event.daysLeft} أيام</Text>
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
            <Text style={styles.ordersTitle}>طلبات مسجلة</Text>
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

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  scroll: { flex: 1 },
  heroSection: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
  heroText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xxxl,
    color: C.black,
    textAlign: 'right',
    lineHeight: 36,
  },
  section: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: C.primary,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  eventIconWrap: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  eventIcon: { fontSize: 20 },
  eventContent: { flex: 1, alignItems: 'flex-end' },
  eventTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
  },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
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
  eventLeft: { marginRight: Spacing.xs },
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
    textAlign: 'right',
    marginBottom: Spacing.base,
  },
});
