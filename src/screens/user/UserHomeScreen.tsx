import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
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

const GiftCard: React.FC<{ title: string; price: string; tag: string }> = ({ title, price, tag }) => (
  <View style={giftCardStyles.card}>
    <View style={giftCardStyles.img}>
      <Text style={giftCardStyles.imgEmoji}>🎁</Text>
    </View>
    <View style={giftCardStyles.tagWrap}>
      <Text style={giftCardStyles.tag}>{tag}</Text>
    </View>
    <Text style={giftCardStyles.title} numberOfLines={2}>{title}</Text>
    <Text style={giftCardStyles.price}>{price} ر.س</Text>
  </View>
);

const giftCardStyles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    marginLeft: Spacing.base,
    padding: Spacing.sm,
    ...Shadow.card,
  },
  img: {
    height: 120,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  imgEmoji: { fontSize: 48 },
  tagWrap: {
    backgroundColor: Colors.primaryLighter,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  tag: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xs, color: Colors.primary },
  title: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: Colors.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  price: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
    textAlign: 'right',
  },
});

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
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

        {/* Hero text */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>اختيارات{'\n'}تصنع لحظة لا تُنسى</Text>
        </View>

        {/* Gift Cards Carousel */}
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

        {/* Weekly Calendar */}
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

        {/* Upcoming events */}
        <View style={styles.section}>
          {UPCOMING_EVENTS.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventLeft}>
                <View style={[styles.prepBtn]}>
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

        {/* Registered Orders */}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flex: 1 },
  heroSection: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
  heroText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xxxl,
    color: Colors.black,
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
    color: Colors.black,
  },
  seeAll: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.primary,
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
  eventCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  eventIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  eventIcon: { fontSize: 20 },
  eventContent: { flex: 1, alignItems: 'flex-end' },
  eventTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'right',
  },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventDate: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.xs,
    color: Colors.gray500,
  },
  eventDays: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  eventLeft: { marginRight: Spacing.xs },
  prepBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  prepBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  ordersCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
  },
  ordersTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.primary,
    textAlign: 'right',
    marginBottom: Spacing.base,
  },
});
