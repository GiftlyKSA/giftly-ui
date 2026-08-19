import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '../../api/client';
import { getOrder } from '../../api/giftly';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  orderId: string;
  onAssigned: (orderId: string) => void;
  onBackHome: () => void;
}

export const WaitingScreen: React.FC<Props> = ({ orderId, onAssigned, onBackHome }) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);
  const [msgIndex, setMsgIndex] = useState(0);
  const navigated = useRef(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const msgFade = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  const orderQuery = useQuery({
    queryKey: ['order', orderId],
    queryFn: ({ signal }) => getOrder(orderId, signal),
    refetchInterval: query => {
      const status = query.state.data?.status;
      return status === 'NEW' || status === 'ASSIGNED' ? 5_000 : false;
    },
  });

  useEffect(() => {
    const pulseAnimation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    const spinAnimation = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 3_000, useNativeDriver: true }));
    pulseAnimation.start();
    spinAnimation.start();
    return () => {
      pulseAnimation.stop();
      spinAnimation.stop();
    };
  }, [pulse, spin]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(msgFade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(msgFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setMsgIndex(index => (index + 1) % t.wait_msgs.length);
    }, 2_500);
    return () => clearInterval(interval);
  }, [msgFade, t.wait_msgs.length]);

  useEffect(() => {
    if (orderQuery.data?.status === 'ASSIGNED' && !navigated.current) {
      navigated.current = true;
      onAssigned(orderId);
    }
  }, [onAssigned, orderId, orderQuery.data?.status]);

  const spinInterpolate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const currentMessage = t.wait_msgs[msgIndex];
  const terminalError = orderQuery.data && orderQuery.data.status !== 'NEW' && orderQuery.data.status !== 'ASSIGNED'
    ? `This order is now ${orderQuery.data.status.replaceAll('_', ' ').toLowerCase()}.`
    : '';

  return (
    <View style={styles.root}>
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />
      <View style={styles.center}>
        <Animated.View style={[styles.spinRing, { transform: [{ rotate: spinInterpolate }] }]} />
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulse }] }]}><Text style={styles.iconEmoji}>G</Text></Animated.View>
        <Animated.View style={[styles.msgWrap, { opacity: msgFade }]}>
          <Text style={styles.msgIcon}>{currentMessage.icon}</Text>
          <Text style={styles.msgText}>{currentMessage.text}</Text>
        </Animated.View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.wait_title}</Text>
          <Text style={styles.infoBody}>{t.wait_body}</Text>
          {orderQuery.isFetching ? <ActivityIndicator color={C.primary} style={styles.spinner} /> : null}
          {orderQuery.isError || terminalError ? <Text style={styles.error}>{terminalError || getErrorMessage(orderQuery.error)}</Text> : null}
          {orderQuery.isError ? <TouchableOpacity onPress={() => void orderQuery.refetch()}><Text style={styles.retry}>Retry</Text></TouchableOpacity> : null}
        </View>
      </View>
      <TouchableOpacity style={styles.backBtn} onPress={onBackHome} activeOpacity={0.7}>
        <Text style={styles.backText}>{t.wait_back}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white, justifyContent: 'space-between', paddingBottom: Spacing.xxxl + 16 },
  bgCircleTop: { position: 'absolute', top: -120, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: C.primaryLighter, opacity: 0.6 },
  bgCircleBottom: { position: 'absolute', bottom: -100, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: C.primaryLighter, opacity: 0.4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.xl },
  spinRing: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: C.primary, borderStyle: 'dashed', opacity: 0.35 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.primaryLighter, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.primaryLight },
  iconEmoji: { fontFamily: Fonts.inter.bold, fontSize: 48, color: C.primary },
  msgWrap: { alignItems: 'center', gap: Spacing.xs },
  msgIcon: { fontSize: 28 },
  msgText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.primary, textAlign: 'center' },
  infoCard: { backgroundColor: C.primaryLighter, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: C.primaryLight, width: '100%', alignItems: 'center' },
  infoTitle: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.md, color: C.primary, textAlign: 'center', marginBottom: Spacing.sm },
  infoBody: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.dark, textAlign: 'center', lineHeight: 22 },
  spinner: { marginTop: Spacing.base },
  error: { fontFamily: Fonts.tajawal.regular, color: C.error, textAlign: 'center', marginTop: Spacing.base },
  retry: { fontFamily: Fonts.tajawal.bold, color: C.primary, marginTop: Spacing.sm },
  backBtn: { marginHorizontal: Spacing.xl, borderWidth: 1.5, borderColor: C.gray200, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  backText: { fontFamily: Fonts.tajawal.medium, fontSize: FontSize.base, color: C.textSecondary },
});
