import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radius, Fonts, FontSize } from '../../constants/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'اختيارات تصنع\nلحظة لا تُنسى',
    subtitle: 'اعثر على الهدية المثالية لكل مناسبة\nمع خبراء الهدايا لدينا',
    emoji: '🎁',
  },
  {
    id: '2',
    title: 'خبراء الهدايا\nفي خدمتك',
    subtitle: 'يساعدك خبراؤنا في اختيار\nأفضل الهدايا المصممة خصيصاً لك',
    emoji: '🌟',
  },
  {
    id: '3',
    title: 'تتبع طلبك\nبكل سهولة',
    subtitle: 'تابع حالة هديتك خطوة بخطوة\nحتى تصل إلى وجهتها',
    emoji: '📦',
  },
];

const LAST = slides.length - 1;

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  // Tracks horizontal scroll to compute skip opacity smoothly
  const scrollX = useRef(new Animated.Value(0)).current;

  // Fade skip button out as the user scrolls toward the last slide
  const skipOpacity = useMemo(
    () =>
      scrollX.interpolate({
        inputRange: [(LAST - 1) * width, LAST * width],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
    [],
  );

  useEffect(() => {
    if (currentIndex === LAST) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [currentIndex]);

  const goToIndex = (idx: number) => {
    // scrollToOffset is reliable in both LTR and RTL — avoids jumpiness of scrollToIndex
    flatRef.current?.scrollToOffset({ offset: idx * width, animated: true });
    setCurrentIndex(idx);
  };

  const handleNext = () => {
    if (currentIndex < LAST) goToIndex(currentIndex + 1);
    else onFinish();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#673195', '#4A1580']} style={StyleSheet.absoluteFillObject} />

      {/* Skip fades out when approaching the last slide */}
      <Animated.View style={[styles.skip, { opacity: skipOpacity }]} pointerEvents={currentIndex === LAST ? 'none' : 'auto'}>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots — tappable */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToIndex(i)}>
            <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {currentIndex < LAST ? (
          <TouchableOpacity style={styles.btnPrimary} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>التالي</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity style={styles.btnStart} onPress={onFinish} activeOpacity={0.85}>
                <Text style={styles.btnStartText}>ابدأ الآن 🚀</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.startHint} onPress={onFinish} activeOpacity={0.7}>
              <Text style={styles.startHintText}>اضغط هنا للانطلاق ←</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLinkWrap} onPress={onFinish}>
              <Text style={styles.loginLink}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 55, left: 24, zIndex: 10 },
  skipText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: 'rgba(255,255,255,0.7)' },
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
  startHint: { alignItems: 'center', paddingVertical: 4 },
  startHintText: { fontFamily: Fonts.tajawal.medium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  loginLinkWrap: { alignItems: 'center' },
  loginLink: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
});
