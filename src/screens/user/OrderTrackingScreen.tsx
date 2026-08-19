import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../api/client';
import { approveOrder, cancelOrder, getOrder } from '../../api/giftly';
import { OrderStatus } from '../../api/types';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';
import { canCancelOrder, formatOrderDate, statusLabel } from '../../utils/orders';

interface OrderTrackingScreenProps {
  orderId: string;
  isAgent: boolean;
  onBack: () => void;
  onChat: () => void;
}

const stageProgress: Record<OrderStatus, number> = {
  NEW: 0,
  ASSIGNED: 1,
  WAITING_PAYMENT: 1,
  IN_PROGRESS: 3,
  DELIVERED: 4,
  COMPLETED: 4,
  CANCELLED: 0,
  DISPUTED: 3,
  REFUNDED: 4,
};

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ orderId, isAgent, onBack, onChat }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const topPadding = useTopInset();
  const queryClient = useQueryClient();
  const orderQuery = useQuery({ queryKey: ['order', orderId], queryFn: ({ signal }) => getOrder(orderId, signal) });
  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: order => {
      queryClient.setQueryData(['order', orderId], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['available-orders'] });
    },
  });
  const approveMutation = useMutation({
    mutationFn: () => approveOrder(orderId),
    onSuccess: order => {
      queryClient.setQueryData(['order', orderId], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const order = orderQuery.data;
  const mutationError = cancelMutation.error || approveMutation.error;
  const stages = t.track_stages.map((label, index) => ({ label, index }));
  const progress = order ? stageProgress[order.status] : 0;

  const confirmCancel = () => {
    Alert.alert('Cancel order?', 'This action is only available before the order is in progress.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backIcon}>{t.back_arrow}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{t.track_title}</Text>
        <TouchableOpacity onPress={onChat} style={styles.chatBtn}><Text style={styles.chatIcon}>◉</Text></TouchableOpacity>
      </View>

      {orderQuery.isLoading ? <View style={styles.loading}><ActivityIndicator color={C.primary} /><Text style={styles.loadingText}>Loading order…</Text></View> : null}
      {orderQuery.isError ? <View style={styles.loading}><Text style={styles.error}>{getErrorMessage(orderQuery.error)}</Text><TouchableOpacity onPress={() => void orderQuery.refetch()}><Text style={styles.retry}>Retry</Text></TouchableOpacity></View> : null}

      {order ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.orderIdCard, Shadow.card]}>
            <View style={styles.orderIdRow}><Text style={styles.orderId}>{order.id}</Text><Text style={styles.status}>{statusLabel(order.status)}</Text></View>
            <View style={styles.orderMeta}>
              <Meta label={t.track_order_date} value={formatOrderDate(order.delivery_date, lang)} C={C} />
              <View style={styles.metaDivider} />
              <Meta label={t.track_amount} value={`${order.total_amount} SAR`} C={C} />
              <View style={styles.metaDivider} />
              <Meta label={t.create_city} value={order.delivery_city} C={C} />
            </View>
          </View>

          <View style={[styles.summaryCard, Shadow.card]}>
            <Text style={styles.summaryTitle}>{order.description || 'Gift delivery request'}</Text>
            <Text style={styles.summaryBody}>Status is maintained by the server and updates after each authorized action.</Text>
          </View>

          <View style={[styles.timelineCard, Shadow.card]}>
            <Text style={styles.timelineTitle}>{t.track_stages_title}</Text>
            {stages.map(stage => {
              const done = stage.index < progress || order.status === 'COMPLETED';
              const active = stage.index === progress && !['CANCELLED', 'REFUNDED'].includes(order.status);
              return (
                <View key={stage.index} style={styles.stageRow}>
                  {stage.index < stages.length - 1 ? <View style={[styles.stageLine, done && styles.stageLineDone]} /> : null}
                  <View style={[styles.stageDot, done && styles.stageDotDone, active && styles.stageDotActive]}><Text style={styles.stageDotText}>{done ? '✓' : stage.index + 1}</Text></View>
                  <View style={styles.stageContent}>
                    <Text style={[styles.stageLabel, done && styles.stageLabelDone, active && styles.stageLabelActive]}>{stage.label}</Text>
                    {active ? <Text style={styles.stageSubLabel}>{statusLabel(order.status)}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>

          {isAgent && order.latitude !== null && order.longitude !== null ? (
            <View style={[styles.locationCard, Shadow.card]}>
              <Text style={styles.locationTitle}>Delivery coordinates</Text>
              <Text style={styles.locationValue}>{order.latitude.toFixed(5)}, {order.longitude.toFixed(5)}</Text>
              <Text style={styles.locationNote}>Visible only after you have accepted this request.</Text>
            </View>
          ) : null}

          {mutationError ? <Text style={styles.error}>{getErrorMessage(mutationError)}</Text> : null}
          <View style={styles.actions}>
            {canCancelOrder(order.status) ? <TouchableOpacity style={styles.cancelBtn} onPress={confirmCancel} disabled={cancelMutation.isPending}><Text style={styles.cancelBtnText}>{cancelMutation.isPending ? 'Cancelling…' : t.track_cancel}</Text></TouchableOpacity> : null}
            {!isAgent && order.status === 'DELIVERED' ? <TouchableOpacity style={styles.primaryBtn} onPress={() => approveMutation.mutate()} disabled={approveMutation.isPending}><Text style={styles.primaryBtnText}>{approveMutation.isPending ? 'Approving…' : 'Approve delivery'}</Text></TouchableOpacity> : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={onChat}><Text style={styles.primaryBtnText}>{t.track_chat}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
};

const Meta: React.FC<{ label: string; value: string; C: ThemeColors }> = ({ label, value, C }) => (
  <View style={metaStyles.item}><Text style={[metaStyles.value, { color: C.black }]} numberOfLines={1}>{value}</Text><Text style={[metaStyles.label, { color: C.textSecondary }]}>{label}</Text></View>
);

const metaStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  value: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.sm, textAlign: 'center' },
  label: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, textAlign: 'center', marginTop: 2 },
});

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg },
  backBtn: { padding: Spacing.sm }, backIcon: { fontSize: 20, color: C.primary }, headerTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.black }, chatBtn: { padding: Spacing.sm }, chatIcon: { fontSize: 22, color: C.primary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  loadingText: { fontFamily: Fonts.tajawal.regular, color: C.textSecondary },
  retry: { fontFamily: Fonts.tajawal.bold, color: C.primary },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  orderIdCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.base },
  orderIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  orderId: { flex: 1, fontFamily: Fonts.inter.bold, fontSize: FontSize.sm, color: C.black },
  status: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.sm, color: C.primary, textAlign: isRTL ? 'left' : 'right' },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between' }, metaDivider: { width: 1, backgroundColor: C.gray200 },
  summaryCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.base },
  summaryTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.black, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.xs },
  summaryBody: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.textSecondary, textAlign: isRTL ? 'right' : 'left' },
  timelineCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.base },
  timelineTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.black, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.base },
  stageRow: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative', paddingBottom: Spacing.base, gap: Spacing.base },
  stageLine: { position: 'absolute', left: 19, top: 40, bottom: -Spacing.base, width: 2, backgroundColor: C.gray200 }, stageLineDone: { backgroundColor: C.primary },
  stageDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gray100, alignItems: 'center', justifyContent: 'center' }, stageDotDone: { backgroundColor: C.primaryLighter }, stageDotActive: { backgroundColor: C.primaryButton }, stageDotText: { fontFamily: Fonts.inter.bold, color: C.black },
  stageContent: { flex: 1, paddingTop: 8, alignItems: isRTL ? 'flex-end' : 'flex-start' }, stageLabel: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary }, stageLabelDone: { color: C.black }, stageLabelActive: { fontFamily: Fonts.tajawal.bold, color: C.primary }, stageSubLabel: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, color: C.primary, marginTop: 2 },
  locationCard: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.base }, locationTitle: { fontFamily: Fonts.tajawal.bold, color: C.black, marginBottom: Spacing.xs }, locationValue: { fontFamily: Fonts.inter.bold, color: C.primary }, locationNote: { fontFamily: Fonts.tajawal.regular, color: C.textSecondary, fontSize: FontSize.xs, marginTop: Spacing.xs },
  actions: { flexDirection: 'row', gap: Spacing.sm }, cancelBtn: { flex: 1, borderWidth: 2, borderColor: C.error, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' }, cancelBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.error }, primaryBtn: { flex: 1, backgroundColor: C.primaryButton, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' }, primaryBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: '#FFFFFF', textAlign: 'center' },
  error: { fontFamily: Fonts.tajawal.regular, color: C.error, textAlign: 'center', marginBottom: Spacing.base },
});
