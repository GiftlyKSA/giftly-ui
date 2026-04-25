import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');
const LAST = 2;

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    { id: '1', title: t.ob_s1_title, subtitle: t.ob_s1_sub, emoji: '🎁' },
    { id: '2', title: t.ob_s2_title, subtitle: t.ob_s2_sub, emoji: '🌟' },
    { id: '3', title: t.ob_s3_title, subtitle: t.ob_s3_sub, emoji: '📦' },
  ];

  const logicalToPhysical = (idx: number) => (isRTL ? LAST - idx : idx);
  const physicalToLogical = (idx: number) => (isRTL ? LAST - idx : idx);
  const renderedSlides = isRTL ? [...slides].reverse() : slides;
  const initialPhysicalIndex = logicalToPhysical(0);

  useEffect(() => {
    setCurrentIndex(0);
    flatRef.current?.scrollToOffset({ offset: initialPhysicalIndex * width, animated: false });
    scrollX.setValue(initialPhysicalIndex * width);
  }, [initialPhysicalIndex, scrollX]);

  const skipOpacity = scrollX.interpolate({
    inputRange: isRTL ? [0, width] : [(LAST - 1) * width, LAST * width],
    outputRange: isRTL ? [0, 1] : [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (currentIndex === LAST) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }

    pulse.stopAnimation();
    pulse.setValue(1);
  }, [currentIndex, pulse]);

  const goToIndex = (idx: number) => {
    const next = Math.max(0, Math.min(idx, LAST));
    flatRef.current?.scrollToOffset({
      offset: logicalToPhysical(next) * width,
      animated: true,
    });
    setCurrentIndex(next);
  };

  const handleNext = () => {
    if (currentIndex < LAST) goToIndex(currentIndex + 1);
    else onFinish();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#673195', '#4A1580']} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.skip, { opacity: skipOpacity }]} pointerEvents={currentIndex === LAST ? 'none' : 'auto'}>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skipText}>{t.ob_skip}</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.flatWrap}>
        <FlatList
          ref={flatRef}
          data={renderedSlides}
          horizontal
          pagingEnabled
          initialScrollIndex={initialPhysicalIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={e => {
            const physical = Math.round(e.nativeEvent.contentOffset.x / width);
            const logical = physicalToLogical(physical);
            setCurrentIndex(Math.max(0, Math.min(logical, LAST)));
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { direction: isRTL ? 'rtl' : 'ltr' }]}>
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          )}
        />

        <View style={[styles.dots, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goToIndex(i)}>
              <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {currentIndex < LAST ? (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>{t.ob_next}</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity style={styles.btnStart} onPress={onFinish} activeOpacity={0.85}>
              <Text style={styles.btnStartText}>{t.ob_start}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 55, left: 24, zIndex: 10 },
  skipText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: 'rgba(255,255,255,0.7)' },
  flatWrap: { flex: 1 },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emojiWrap: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: { fontSize: 80 },
  title: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxxl,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: Spacing.base,
  },
  subtitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 24, backgroundColor: '#FFFFFF' },
  footer: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: '#673195' },
  btnStart: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnStartText: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.md, color: '#673195' },
});
