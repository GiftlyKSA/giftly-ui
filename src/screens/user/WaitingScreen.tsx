import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onDone: () => void;
  onBackHome: () => void;
}

export const WaitingScreen: React.FC<Props> = ({ onDone, onBackHome }) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);

  const [msgIndex, setMsgIndex] = useState(0);

  const pulse = useRef(new Animated.Value(1)).current;
  const msgFade = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(msgFade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(msgFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setMsgIndex(i => (i + 1) % t.wait_msgs.length);
    }, 750);
    return () => clearInterval(id);
  }, [t.wait_msgs.length]);

  useEffect(() => {
    const id = setTimeout(() => onDone(), 3000);
    return () => clearTimeout(id);
  }, []);

  const spinInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const { icon, text } = t.wait_msgs[msgIndex];

  return (
    <View style={styles.root}>
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <View style={styles.center}>
        <Animated.View style={[styles.spinRing, { transform: [{ rotate: spinInterpolate }] }]} />

        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.iconEmoji}>🎁</Text>
        </Animated.View>

        <Animated.View style={[styles.msgWrap, { opacity: msgFade }]}>
          <Text style={styles.msgIcon}>{icon}</Text>
          <Text style={styles.msgText}>{text}</Text>
        </Animated.View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.wait_title}</Text>
          <Text style={styles.infoBody}>{t.wait_body}</Text>
        </View>

        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <DotBounce key={i} delay={i * 200} color={C.primary} />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={onBackHome} activeOpacity={0.7}>
        <Text style={styles.backText}>{t.wait_back}</Text>
      </TouchableOpacity>
    </View>
  );
};

const DotBounce: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -10, duration: 350, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 350, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={[dotStyle.dot, { backgroundColor: color, transform: [{ translateY: bounce }] }]}
    />
  );
};

const dotStyle = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5, opacity: 0.7 },
});

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.white,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxxl + 16,
  },
  bgCircleTop: {
    position: 'absolute', top: -120, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: C.primaryLighter, opacity: 0.6,
  },
  bgCircleBottom: {
    position: 'absolute', bottom: -100, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: C.primaryLighter, opacity: 0.4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  spinRing: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 3, borderColor: C.primary,
    borderStyle: 'dashed', opacity: 0.35,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.primaryLight,
  },
  iconEmoji: { fontSize: 48 },
  msgWrap: { alignItems: 'center', gap: Spacing.xs },
  msgIcon: { fontSize: 28 },
  msgText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.lg,
    color: C.primary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: C.primaryLighter,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: C.primaryLight,
    width: '100%',
  },
  infoTitle: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.md,
    color: C.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  infoBody: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.dark,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' },
  backBtn: {
    marginHorizontal: Spacing.xl,
    borderWidth: 1.5,
    borderColor: C.gray200,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  backText: {
    fontFamily: Fonts.tajawal.medium,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
});
