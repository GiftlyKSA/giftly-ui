import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { OrderStatus } from '../api/types';
import { statusLabel } from '../utils/orders';

interface OrderCardProps {
  orderId: string;
  eventName: string;
  status: OrderStatus;
  time?: string;
  messageCount?: number;
  onPress?: () => void;
  onViewDetails?: () => void;
  actionLabel?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId, eventName, status, time, messageCount = 0, onPress, onViewDetails, actionLabel,
}) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);

  const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    NEW: { label: statusLabel(status), color: C.info, bg: C.infoBg },
    ASSIGNED: { label: statusLabel(status), color: C.info, bg: C.infoBg },
    WAITING_PAYMENT: { label: statusLabel(status), color: '#B7791F', bg: 'rgba(183,121,31,0.12)' },
    IN_PROGRESS: { label: statusLabel(status), color: '#4CAF50', bg: 'rgba(76,175,80,0.2)' },
    DELIVERED: { label: statusLabel(status), color: C.teal, bg: 'rgba(38,143,133,0.2)' },
    COMPLETED: { label: statusLabel(status), color: C.teal, bg: 'rgba(38,143,133,0.2)' },
    CANCELLED: { label: statusLabel(status), color: C.error, bg: 'rgba(219,13,13,0.1)' },
    DISPUTED: { label: statusLabel(status), color: '#C05621', bg: 'rgba(192,86,33,0.12)' },
    REFUNDED: { label: statusLabel(status), color: C.textSecondary, bg: C.gray100 },
  };

  const cfg = statusConfig[status];

  return (
    <TouchableOpacity style={[styles.card, Shadow.card]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>🎁</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.orderId}>{orderId}</Text>
        <Text style={styles.eventName}>{eventName}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
        {onViewDetails ? (
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.viewDetails}>{actionLabel ?? t.ord_view}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.right}>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        {messageCount > 0 && (
          <View style={styles.messageBadge}>
            <Text style={styles.messageIcon}>💬</Text>
            <Text style={styles.messageCount}>{messageCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: C.primaryLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 18 },
  content: { flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' },
  orderId: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
  },
  eventName: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    textAlign: isRTL ? 'right' : 'left',
  },
  time: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.xs,
    color: C.gray500,
    marginTop: 2,
  },
  viewDetails: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.black,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  right: { alignItems: isRTL ? 'flex-start' : 'flex-end', gap: Spacing.xs },
  statusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xs,
  },
  messageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray200,
    borderRadius: 13,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  messageIcon: { fontSize: 10 },
  messageCount: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
});
