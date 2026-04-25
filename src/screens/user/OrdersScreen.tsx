import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';
import { OrderCard } from '../../components/OrderCard';
import { BottomTabBar } from '../../components/BottomTabBar';

I18nManager.forceRTL(true);

interface OrdersScreenProps {
  isAgent?: boolean;
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

const ALL_ORDERS = [
  { id: 'ORD-593821', eventName: 'يوم ميلاد', status: 'preparing' as const, time: '12:00 - 16:00', messageCount: 20 },
  { id: 'ORD-593822', eventName: 'يوم تخرج', status: 'delivering' as const, time: '10:00 - 14:00', messageCount: 5 },
  { id: 'ORD-593823', eventName: 'يوم زواج', status: 'delivered' as const, time: '09:00 - 12:00', messageCount: 0 },
  { id: 'ORD-593824', eventName: 'عيد ميلاد', status: 'cancelled' as const, time: '14:00 - 18:00', messageCount: 2 },
];

const FILTERS = ['الكل', 'نشط', 'مكتمل', 'ملغي'];

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  isAgent = false, onOrderPress, onTabPress,
}) => {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const topPadding = useTopInset();

  const [activeFilter, setActiveFilter] = useState('الكل');
  const [activeTab, setActiveTab] = useState('orders');

  const filteredOrders = ALL_ORDERS.filter(o => {
    if (activeFilter === 'الكل') return true;
    if (activeFilter === 'نشط') return o.status === 'preparing' || o.status === 'delivering';
    if (activeFilter === 'مكتمل') return o.status === 'delivered';
    if (activeFilter === 'ملغي') return o.status === 'cancelled';
    return true;
  });

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        <Text style={styles.headerTitle}>طلباتي</Text>
      </View>

      <View style={styles.filtersWrap}>
        <FlatList
          horizontal
          inverted
          data={FILTERS}
          keyExtractor={f => f}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterBtn, activeFilter === item && styles.filterBtnActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl, gap: Spacing.sm }}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>{filteredOrders.length} طلب</Text>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <OrderCard
            orderId={item.id}
            eventName={item.eventName}
            status={item.status}
            time={item.time}
            messageCount={item.messageCount}
            onPress={() => onOrderPress(item.id)}
            onViewDetails={() => onOrderPress(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptySubtitle}>لم تقم بأي طلبات بعد</Text>
          </View>
        }
      />

      <BottomTabBar activeRoute={activeTab} onTabPress={handleTab} isAgent={isAgent} />
    </View>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: {
    backgroundColor: C.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.black,
  },
  filtersWrap: { paddingVertical: Spacing.base },
  filterBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xxl,
    backgroundColor: C.gray100,
  },
  filterBtnActive: { backgroundColor: C.primary },
  filterText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
  filterTextActive: {
    fontFamily: Fonts.tajawal.bold,
    color: '#FFFFFF',
  },
  summary: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    alignItems: 'flex-end',
  },
  summaryText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', paddingTop: Spacing.xxxl * 2 },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.base },
  emptyTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.black,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
});
