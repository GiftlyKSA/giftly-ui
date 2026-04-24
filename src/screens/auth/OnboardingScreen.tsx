import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, ImageBackground, I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';

I18nManager.forceRTL(true);

const { width, height } = Dimensions.get('window');

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

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, '#4A1580']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.skipText}>تخطي</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
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

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
          <Text style={styles.btnPrimaryText}>
            {currentIndex === slides.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </Text>
        </TouchableOpacity>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: { fontSize: 80 },
  title: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxxl,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.base,
  },
  subtitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 24, backgroundColor: Colors.white },
  footer: { paddingHorizontal: 24, paddingBottom: 48, gap: 16 },
  btnPrimary: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: Colors.primary },
  loginLink: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});
