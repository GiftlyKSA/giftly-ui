import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTopInset } from '../../hooks/useTopInset';

interface OrderTrackingScreenProps {
  orderId?: string;
  isAgent?: boolean;
  onBack: () => void;
  onChat: () => void;
}

const STAGE_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'document-text-outline', 'construct-outline', 'cube-outline', 'car-outline', 'checkmark-circle-outline',
];
const STAGE_DONE = [true, true, true, false, false];
const STAGE_ACTIVE = [false, false, false, true, false];

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId = 'ORD-593821', isAgent = false, onBack, onChat,
}) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
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
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.orderIdCard, Shadow.card]}>
          <View style={styles.orderIdRow}>
            <TouchableOpacity style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={13} color={C.primary} />
              <Text style={styles.copyText}>{t.track_copy}</Text>
            </TouchableOpacity>
            <Text style={styles.orderId}>{orderId}</Text>
          </View>
          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>12:00 - 16:00</Text>
              <View style={styles.metaLabelRow}>
                <Ionicons name="time-outline" size={11} color={C.textSecondary} />
                <Text style={styles.metaLabel}>{t.track_delivery_time}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>9 أبريل 2025</Text>
              <View style={styles.metaLabelRow}>
                <Ionicons name="calendar-outline" size={11} color={C.textSecondary} />
                <Text style={styles.metaLabel}>{t.track_order_date}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>250 ر.س</Text>
              <View style={styles.metaLabelRow}>
                <Ionicons name="cash-outline" size={11} color={C.textSecondary} />
                <Text style={styles.metaLabel}>{t.track_amount}</Text>
              </View>
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
                <Ionicons
                  name={stage.icon}
                  size={18}
                  color={stage.active ? '#FFFFFF' : stage.done ? C.primary : C.gray500}
                />
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
            <Ionicons name="map-outline" size={34} color={C.primary} style={styles.mapEmoji} />
            <Text style={styles.mapText}>{t.track_live}</Text>
            <Text style={styles.mapSub}>{t.track_live_sub}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>{t.track_cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatActionBtn} onPress={onChat}>
            <Ionicons name="chatbubbles-outline" size={16} color="#FFFFFF" />
            <Text style={styles.chatActionText}>{isAgent ? t.track_chat_agent : t.track_chat}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: {
    flexDirection: 'row',
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
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  orderIdCard: {
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  orderIdRow: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaValue: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.black,
    textAlign: 'center',
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  metaLabel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    textAlign: 'center',
  },
  metaDivider: { width: 1, backgroundColor: C.gray200 },
  giftPreview: {
    flexDirection: 'row',
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
  giftInfo: { flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' },
  giftName: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: 4,
  },
  giftOccasion: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: Spacing.sm,
  },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: Spacing.base,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: Spacing.base,
    gap: Spacing.base,
  },
  stageLine: {
    position: 'absolute',
    right: isRTL ? 19 : undefined,
    left: isRTL ? undefined : 19,
    top: 40,
    bottom: -Spacing.base,
    width: 2,
    backgroundColor: C.gray200,
  },
  stageLineDone: { backgroundColor: C.primary },
  stageDot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  stageDotDone: { backgroundColor: C.primaryLighter },
  stageDotActive: { backgroundColor: C.primaryButton },
  stageContent: { flex: 1, paddingTop: 8, alignItems: isRTL ? 'flex-end' : 'flex-start' },
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
  mapEmoji: { marginBottom: Spacing.sm },
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
  actions: { flexDirection: 'row', gap: Spacing.sm },
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
    flexDirection: 'row',
    gap: 6,
    backgroundColor: C.primaryButton,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatActionText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
  },
});
