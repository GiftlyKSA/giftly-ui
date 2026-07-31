import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../api/client';
import { acceptOrder, listAvailableOrders, listOrders } from '../../api/giftly';
import { OrderSummary } from '../../api/types';
import { BottomTabBar } from '../../components/BottomTabBar';
import { OrderCard } from '../../components/OrderCard';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { formatOrderDate, isOrderActive, isOrderCancelled, isOrderComplete, orderTitle } from '../../utils/orders';
import { useTopInset } from '../../hooks/useTopInset';

interface OrdersScreenProps {
  isAgent?: boolean;
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

type FilterKey = 'all' | 'active' | 'done' | 'cancelled';
const FILTER_KEYS: FilterKey[] = ['all', 'active', 'done', 'cancelled'];

const matchesFilter = (order: OrderSummary, filter: FilterKey): boolean => {
  if (filter === 'all') return true;
  if (filter === 'active') return isOrderActive(order.status);
  if (filter === 'done') return isOrderComplete(order.status);
  return isOrderCancelled(order.status);
};

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ isAgent = false, onOrderPress, onTabPress }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);
  const topPadding = useTopInset();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [acceptError, setAcceptError] = useState('');

  const ordersQuery = useInfiniteQuery({
    queryKey: isAgent ? ['available-orders'] : ['orders'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => isAgent
      ? listAvailableOrders({ cursor: pageParam, limit: 20 }, signal)
      : listOrders({ cursor: pageParam, limit: 20 }, signal),
    getNextPageParam: lastPage => lastPage.next_cursor ?? undefined,
  });
  const acceptMutation = useMutation({
    mutationFn: acceptOrder,
    onSuccess: order => {
      setAcceptError('');
      void queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      onOrderPress(order.id);
    },
    onError: error => setAcceptError(getErrorMessage(error)),
  });

  const orders = ordersQuery.data?.pages.flatMap(page => page.items) ?? [];
  const visibleOrders = isAgent ? orders : orders.filter(order => matchesFilter(order, activeFilter));

  const filterLabel = (key: FilterKey): string => {
    if (key === 'all') return t.ord_all;
    if (key === 'active') return t.ord_active;
    if (key === 'done') return t.ord_done;
    return t.ord_cancelled;
  };

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        <Text style={styles.headerTitle}>{isAgent ? 'Available requests' : t.ord_title}</Text>
      </View>

      {!isAgent ? (
        <View style={styles.filtersWrap}>
          <FlatList
            horizontal
            data={FILTER_KEYS}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.filterBtn, activeFilter === item && styles.filterBtnActive]} onPress={() => setActiveFilter(item)}>
                <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{filterLabel(item)}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          />
        </View>
      ) : null}

      <View style={styles.summary}><Text style={styles.summaryText}>{isAgent ? `${visibleOrders.length} available` : t.ord_count(visibleOrders.length)}</Text></View>
      {ordersQuery.isError || acceptError ? <Text style={styles.error}>{acceptError || getErrorMessage(ordersQuery.error)}</Text> : null}

      <FlatList
        data={visibleOrders}
        keyExtractor={order => order.id}
        renderItem={({ item }) => (
          <OrderCard
            orderId={item.id}
            eventName={orderTitle(item)}
            status={item.status}
            time={`${item.delivery_city} · ${formatOrderDate(item.delivery_date, lang)}`}
            onPress={!isAgent ? () => onOrderPress(item.id) : undefined}
            onViewDetails={isAgent && !acceptMutation.isPending ? () => acceptMutation.mutate(item.id) : !isAgent ? () => onOrderPress(item.id) : undefined}
            actionLabel={isAgent ? (acceptMutation.isPending ? 'Accepting…' : 'Accept request') : undefined}
          />
        )}
        refreshControl={<RefreshControl refreshing={ordersQuery.isRefetching} onRefresh={() => void ordersQuery.refetch()} tintColor={C.primary} />}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (ordersQuery.hasNextPage && !ordersQuery.isFetchingNextPage) void ordersQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={ordersQuery.isFetchingNextPage ? <ActivityIndicator color={C.primary} /> : null}
        ListEmptyComponent={ordersQuery.isLoading ? <Text style={styles.stateText}>Loading…</Text> : <View style={styles.emptyWrap}><Text style={styles.emptyTitle}>{isAgent ? 'No requests are available' : t.ord_empty_title}</Text><Text style={styles.emptySubtitle}>{isAgent ? 'Pull to refresh and check again soon.' : t.ord_empty_sub}</Text></View>}
      />
      <BottomTabBar activeRoute={activeTab} onTabPress={handleTab} isAgent={isAgent} />
    </View>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: { backgroundColor: C.white, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg, alignItems: 'flex-end' },
  headerTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.black },
  filtersWrap: { paddingVertical: Spacing.base },
  filters: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  filterBtn: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.xxl, backgroundColor: C.gray100 },
  filterBtnActive: { backgroundColor: C.primary },
  filterText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  filterTextActive: { fontFamily: Fonts.tajawal.bold, color: '#FFFFFF' },
  summary: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm, alignItems: 'flex-end' },
  summaryText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.textSecondary },
  error: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.error, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 105, flexGrow: 1 },
  stateText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary, textAlign: 'center', paddingTop: Spacing.xxxl },
  emptyWrap: { alignItems: 'center', paddingTop: Spacing.xxxl * 2 },
  emptyTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.black, marginBottom: Spacing.xs },
  emptySubtitle: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary, textAlign: 'center' },
});
