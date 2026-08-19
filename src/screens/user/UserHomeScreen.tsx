import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '../../api/client';
import { getWallet, listOrders } from '../../api/giftly';
import { AppHeader } from '../../components/AppHeader';
import { BottomTabBar } from '../../components/BottomTabBar';
import { OrderCard } from '../../components/OrderCard';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { formatOrderDate, orderTitle } from '../../utils/orders';

interface UserHomeScreenProps {
  onOrderPress: (orderId: string) => void;
  onTabPress: (route: string) => void;
}

const GiftCard: React.FC<{ title: string; price: string; tag: string }> = ({ title, price, tag }) => {
  const { C } = useTheme();
  const styles = useMemo(() => createGiftCardStyles(C), [C]);
  return (
    <View style={styles.card}>
      <View style={styles.image}><Text style={styles.imageText}>G</Text></View>
      <Text style={styles.tag}>{tag}</Text>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
};

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({ onOrderPress, onTabPress }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const { profile } = useAuth();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const [activeTab, setActiveTab] = useState('home');

  const walletQuery = useQuery({ queryKey: ['wallet'], queryFn: ({ signal }) => getWallet(signal) });
  const ordersQuery = useQuery({ queryKey: ['orders', 'recent'], queryFn: ({ signal }) => listOrders({ limit: 3 }, signal) });
  const isRefreshing = walletQuery.isRefetching || ordersQuery.isRefetching;

  const refresh = () => {
    void Promise.all([walletQuery.refetch(), ordersQuery.refetch()]);
  };

  const handleTab = (route: string) => {
    setActiveTab(route);
    onTabPress(route);
  };

  return (
    <View style={styles.root}>
      <AppHeader
        userName={profile?.full_name || 'Giftly'}
        balance={walletQuery.data?.available}
        onProfilePress={() => onTabPress('profile')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={C.primary} />}
      >
        <View style={styles.heroSection}><Text style={styles.heroText}>{t.home_hero}</Text></View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{t.home_featured}</Text></View>
          <FlatList
            horizontal
            data={t.gifts}
            renderItem={({ item }) => <GiftCard title={item.title} price={`${item.price} ${t.gift_currency}`} tag={item.tag} />}
            keyExtractor={(_, index) => String(index)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.giftList}
          />
          <Text style={styles.localDataNote}>Featured gifts are currently local content; the backend has no catalogue endpoint.</Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.ordersCard, Shadow.card]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.ordersTitle}>{t.home_orders}</Text>
              <TouchableOpacity onPress={() => onTabPress('orders')}><Text style={styles.seeAll}>{t.home_see_all}</Text></TouchableOpacity>
            </View>
            {ordersQuery.isLoading ? <Text style={styles.stateText}>Loading orders…</Text> : null}
            {ordersQuery.isError ? <Text style={styles.error}>{getErrorMessage(ordersQuery.error)}</Text> : null}
            {ordersQuery.data?.items.map(order => (
              <OrderCard
                key={order.id}
                orderId={order.id}
                eventName={orderTitle(order)}
                status={order.status}
                time={formatOrderDate(order.delivery_date, lang)}
                onPress={() => onOrderPress(order.id)}
                onViewDetails={() => onOrderPress(order.id)}
              />
            ))}
            {!ordersQuery.isLoading && !ordersQuery.isError && ordersQuery.data?.items.length === 0 ? <Text style={styles.stateText}>{t.ord_empty_title}</Text> : null}
          </View>
        </View>
      </ScrollView>
      <BottomTabBar activeRoute={activeTab} onTabPress={handleTab} />
    </View>
  );
};

const createGiftCardStyles = (C: ThemeColors) => StyleSheet.create({
  card: { width: 160, backgroundColor: C.white, borderRadius: Radius.xl, marginRight: Spacing.base, padding: Spacing.sm, ...Shadow.card },
  image: { height: 100, borderRadius: Radius.lg, backgroundColor: C.primaryLighter, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  imageText: { fontFamily: Fonts.inter.bold, fontSize: 38, color: C.primary },
  tag: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xs, color: C.primary, marginBottom: 4 },
  title: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.sm, color: C.black, marginBottom: 4 },
  price: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
});

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  scroll: { flex: 1 },
  content: { paddingBottom: 110 },
  heroSection: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl, alignItems: isRTL ? 'flex-end' : 'flex-start' },
  heroText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xxxl, color: C.black, textAlign: isRTL ? 'right' : 'left', lineHeight: 36 },
  section: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  sectionTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.black },
  seeAll: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.primary },
  giftList: { paddingRight: Spacing.xs },
  localDataNote: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, color: C.textSecondary, marginTop: Spacing.sm, textAlign: isRTL ? 'right' : 'left' },
  ordersCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base },
  ordersTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.primary },
  stateText: { fontFamily: Fonts.tajawal.regular, color: C.textSecondary, textAlign: isRTL ? 'right' : 'left', paddingVertical: Spacing.base },
  error: { fontFamily: Fonts.tajawal.regular, color: C.error, textAlign: isRTL ? 'right' : 'left', paddingVertical: Spacing.base },
});
