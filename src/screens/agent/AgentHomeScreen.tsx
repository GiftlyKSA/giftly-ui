import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../api/client';
import { acceptOrder, listAvailableOrders } from '../../api/giftly';
import { useAuth } from '../../auth/AuthProvider';
import { AppHeader } from '../../components/AppHeader';
import { BottomTabBar } from '../../components/BottomTabBar';
import { OrderCard } from '../../components/OrderCard';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { formatOrderDate, orderTitle } from '../../utils/orders';

interface AgentHomeScreenProps {
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

export const AgentHomeScreen: React.FC<AgentHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const { profile } = useAuth();
  const styles = useMemo(() => createStyles(C, lang === 'ar'), [C, lang]);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [error, setError] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['available-orders', 'home'],
    queryFn: ({ signal }) => listAvailableOrders({ limit: 5 }, signal),
  });
  const acceptMutation = useMutation({
    mutationFn: acceptOrder,
    onSuccess: order => {
      setError('');
      void queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      onOrderPress(order.id);
    },
    onError: acceptError => setError(getErrorMessage(acceptError)),
  });

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <AppHeader
        userName={profile?.full_name || 'Courier'}
        isAgent
        rating={Number(profile?.rating || '0')}
        onProfilePress={() => onTabPress('profile')}
      />
      <FlatList
        data={ordersQuery.data?.items ?? []}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={ordersQuery.isRefetching} onRefresh={() => void ordersQuery.refetch()} tintColor={C.primary} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={[styles.notice, Shadow.card]}>
              <Text style={styles.noticeTitle}>Available delivery requests</Text>
              <Text style={styles.noticeBody}>Only unassigned requests in your registered city are shown. Accepting a request reveals its delivery coordinates.</Text>
            </View>
            <View style={styles.headingRow}>
              <Text style={styles.heading}>{t.agent_recent}</Text>
              <TouchableOpacity onPress={() => onTabPress('orders')}><Text style={styles.link}>{t.agent_see_all}</Text></TouchableOpacity>
            </View>
            {ordersQuery.isLoading ? <Text style={styles.stateText}>Loading requests…</Text> : null}
            {ordersQuery.isError || error ? <Text style={styles.error}>{error || getErrorMessage(ordersQuery.error)}</Text> : null}
          </>
        }
        renderItem={({ item }) => (
          <OrderCard
            orderId={item.id}
            eventName={orderTitle(item)}
            status={item.status}
            time={`${item.delivery_city} · ${formatOrderDate(item.delivery_date, lang)}`}
            onViewDetails={!acceptMutation.isPending ? () => acceptMutation.mutate(item.id) : undefined}
            actionLabel={acceptMutation.isPending ? 'Accepting…' : 'Accept request'}
          />
        )}
        ListEmptyComponent={!ordersQuery.isLoading && !ordersQuery.isError ? <Text style={styles.stateText}>No delivery requests are available right now.</Text> : null}
      />
      <BottomTabBar activeRoute={activeTab} onTabPress={handleTab} isAgent />
    </View>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  content: { padding: Spacing.xl, paddingBottom: 110 },
  notice: { backgroundColor: C.primaryLighter, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.xl, borderWidth: 1, borderColor: C.primaryLight },
  noticeTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.primary, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.xs },
  noticeBody: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.textSecondary, textAlign: isRTL ? 'right' : 'left', lineHeight: 20 },
  headingRow: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  heading: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.black },
  link: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.primary },
  stateText: { fontFamily: Fonts.tajawal.regular, color: C.textSecondary, textAlign: isRTL ? 'right' : 'left', paddingVertical: Spacing.base },
  error: { fontFamily: Fonts.tajawal.regular, color: C.error, textAlign: isRTL ? 'right' : 'left', paddingVertical: Spacing.base },
});
