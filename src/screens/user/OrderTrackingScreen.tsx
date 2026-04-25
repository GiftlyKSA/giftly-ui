import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, I18nManager,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTopInset } from '../../hooks/useTopInset';

I18nManager.forceRTL(true);

interface OrderTrackingScreenProps {
  orderId?: string;
  onBack: () => void;
  onChat: () => void;
}

const STAGE_ICONS = ['📋', '⚙️', '📦', '🚗', '✅'];
const STAGE_DONE = [true, true, true, false, false];
const STAGE_ACTIVE = [false, false, false, true, false];

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId = 'ORD-593821', onBack, onChat,
}) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);
  const topPadding = useTopInset();

  const stages = t.track_stages.map((label, i) => ({
    id: i + 1,
    label,
    icon: STAGE_ICONS[i],
    done: STAGE_DONE[i],
    active: STAGE_ACTIVE[i],
  }));

  return (
    <View style={styles.root}>
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{t.back_arrow}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.track_title}</Text>
        <TouchableOpacity onPress={onChat} style={styles.chatBtn}>
          <Text style={styles.chatIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.orderIdCard, Shadow.card]}>
          <View style={styles.orderIdRow}>
            <TouchableOpacity style={styles.copyBtn}>
              <Text style={styles.copyText}>{t.track_copy}</Text>
            </TouchableOpacity>
            <Text style={styles.orderId}>{orderId}</Text>
          </View>
          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>12:00 - 16:00</Text>
              <Text style={styles.metaLabel}>{t.track_delivery_time}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>9 أبريل 2025</Text>
              <Text style={styles.metaLabel}>{t.track_order_date}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>250 ر.س</Text>
              <Text style={styles.metaLabel}>{t.track_amount}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.giftPreview, Shadow.card]}>
          <View style={styles.giftImgPlaceholder}>
            <Text style={styles.giftEmoji}>🎁</Text>
          </View>
          <View style={styles.giftInfo}>
            <Text style={styles.giftName}>باقة ورد فاخرة</Text>
            <Text style={styles.giftOccasion}>مناسبة: يوم ميلاد</Text>
            <View style={styles.agentRow}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>خ</Text>
              </View>
              <Text style={styles.agentName}>خبير: أحمد محمد</Text>
            </View>
          </View>
        </View>

        <View style={[styles.timelineCard, Shadow.card]}>
          <Text style={styles.timelineTitle}>{t.track_stages_title}</Text>
          {stages.map((stage, idx) => (
            <View key={stage.id} style={styles.stageRow}>
              {idx < stages.length - 1 && (
                <View style={[styles.stageLine, stage.done && styles.stageLineDone]} />
              )}
              <View style={[
                styles.stageDot,
                stage.done && styles.stageDotDone,
                stage.active && styles.stageDotActive,
              ]}>
                <Text style={styles.stageDotText}>{stage.icon}</Text>
              </View>
              <View style={styles.stageContent}>
                <Text style={[
                  styles.stageLabel,
                  stage.done && styles.stageLabelDone,
                  stage.active && styles.stageLabelActive,
                ]}>
                  {stage.label}
                </Text>
                {stage.active && (
                  <Text style={styles.stageSubLabel}>{t.track_delivering_now}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.mapCard, Shadow.card]}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapEmoji}>🗺️</Text>
            <Text style={styles.mapText}>{t.track_live}</Text>
            <Text style={styles.mapSub}>{t.track_live_sub}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>{t.track_cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatActionBtn} onPress={onChat}>
            <Text style={styles.chatActionText}>{t.track_chat}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 20, color: C.primary },
  headerTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.black,
  },
  chatBtn: { padding: Spacing.sm },
  chatIcon: { fontSize: 22 },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  orderIdCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  orderIdRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  orderId: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.black,
  },
  copyBtn: {
    backgroundColor: C.primaryLighter,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  copyText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  orderMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  metaItem: { flex: 1, alignItems: 'center' },
  metaValue: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.black,
    textAlign: 'center',
  },
  metaLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  metaDivider: { width: 1, backgroundColor: C.gray200 },
  giftPreview: {
    flexDirection: 'row-reverse',
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    alignItems: 'center',
    gap: Spacing.base,
  },
  giftImgPlaceholder: {
    width: 80, height: 80, borderRadius: Radius.lg,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
  },
  giftEmoji: { fontSize: 36 },
  giftInfo: { flex: 1, alignItems: 'flex-end' },
  giftName: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  giftOccasion: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  agentRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  agentAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  agentAvatarText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.xs,
    color: C.primary,
  },
  agentName: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  timelineCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  timelineTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.black,
    textAlign: 'right',
    marginBottom: Spacing.base,
  },
  stageRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: Spacing.base,
  },
  stageLine: {
    position: 'absolute',
    right: 19, top: 36,
    width: 2, height: '100%',
    backgroundColor: C.gray200,
  },
  stageLineDone: { backgroundColor: C.primary },
  stageDot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.gray100,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Spacing.base,
  },
  stageDotDone: { backgroundColor: C.primaryLighter },
  stageDotActive: { backgroundColor: C.primary },
  stageDotText: { fontSize: 18 },
  stageContent: { flex: 1, paddingTop: 8, alignItems: 'flex-end' },
  stageLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
  stageLabelDone: { color: C.black },
  stageLabelActive: { fontFamily: Fonts.tajawal.bold, color: C.primary },
  stageSubLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.primary,
    marginTop: 2,
  },
  mapCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    height: 160,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
  },
  mapEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  mapText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.primary,
  },
  mapSub: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    marginTop: 4,
  },
  actions: { flexDirection: 'row-reverse', gap: Spacing.sm },
  cancelBtn: {
    flex: 1,
    borderWidth: 2, borderColor: C.error,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.error,
  },
  chatActionBtn: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  chatActionText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
  },
});
