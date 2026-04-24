import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow, Fonts, FontSize } from '../constants/colors';

// Force RTL
I18nManager.forceRTL(true);

interface OrderCardProps {
  orderId: string;
  eventName: string;
  status: 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  time?: string;
  messageCount?: number;
  onPress?: () => void;
  onViewDetails?: () => void;
}

const statusConfig = {
  preparing: { label: 'قيد التجهيز', color: Colors.info, bg: Colors.infoBg },
  delivering: { label: 'خرج للتوصيل', color: '#4CAF50', bg: 'rgba(76,175,80,0.2)' },
  delivered: { label: 'تم التوصيل', color: Colors.teal, bg: 'rgba(38,143,133,0.2)' },
  cancelled: { label: 'ملغي', color: Colors.error, bg: 'rgba(219,13,13,0.1)' },
};

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  eventName,
  status,
  time,
  messageCount = 0,
  onPress,
  onViewDetails,
}) => {
  const cfg = statusConfig[status];

  return (
    <TouchableOpacity style={[styles.card, Shadow.card]} onPress={onPress} activeOpacity={0.85}>
      {/* Icon */}
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🎁</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.orderId}>{orderId}</Text>
        <Text style={styles.eventName}>{eventName}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
        <TouchableOpacity onPress={onViewDetails}>
          <Text style={styles.viewDetails}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>

      {/* Right side */}
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: { marginLeft: Spacing.sm },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(201,174,236,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 18 },
  content: { flex: 1, alignItems: 'flex-end' },
  orderId: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'right',
  },
  eventName: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  time: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  viewDetails: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.black,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  right: { alignItems: 'flex-start', gap: Spacing.xs },
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
    backgroundColor: 'rgba(209,209,214,0.15)',
    borderRadius: 13,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  messageIcon: { fontSize: 10 },
  messageCount: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
