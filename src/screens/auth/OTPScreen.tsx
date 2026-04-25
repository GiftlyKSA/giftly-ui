import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, I18nManager,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

I18nManager.forceRTL(true);

interface OTPScreenProps {
  phone?: string;
  onVerify: () => void;
  onResend: () => void;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
  phone = '05xxxxxxxx', onVerify, onResend,
}) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otp];
    updated[idx] = digit;
    setOtp(updated);
    if (digit && idx < 3) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace') {
      if (otp[idx]) {
        const updated = [...otp];
        updated[idx] = '';
        setOtp(updated);
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
        const updated = [...otp];
        updated[idx - 1] = '';
        setOtp(updated);
      }
    }
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <View style={styles.root}>
      <View style={styles.topArc} />

      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>{t.otp_title}</Text>
        <Text style={styles.subtitle}>
          {t.otp_subtitle}{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {/* OTP boxes — forced LTR so box 0 is always on the left */}
        <View style={styles.otpLtrWrap}>
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={r => (inputs.current[idx] = r)}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                value={digit}
                onChangeText={v => handleChange(v, idx)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                caretHidden
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]}
          onPress={onVerify}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyBtnText}>{t.otp_btn}</Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>{t.otp_no_code}</Text>
          <TouchableOpacity onPress={onResend}>
            <Text style={styles.resendLink}>{t.otp_resend}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  topArc: {
    position: 'absolute', top: -80, left: -60, right: -60,
    height: 280, borderRadius: 200,
    backgroundColor: C.primary, opacity: 0.08,
  },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  icon: { fontSize: 56, marginBottom: Spacing.base },
  title: {
    fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.xxl,
    color: C.black, marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base,
    color: C.textSecondary, textAlign: 'center',
    lineHeight: 24, marginBottom: Spacing.xxl,
  },
  phone: { fontFamily: Fonts.tajawal.bold, color: C.primary },
  otpLtrWrap: { direction: 'ltr', marginBottom: Spacing.xxl },
  otpRow: { flexDirection: 'row', gap: Spacing.base },
  otpBox: {
    width: 56, height: 64, borderRadius: Radius.lg,
    borderWidth: 2, borderColor: C.gray200,
    fontFamily: Fonts.inter.bold, fontSize: FontSize.xxl,
    color: C.black, backgroundColor: C.gray100,
  },
  otpBoxFilled: { borderColor: C.primary, backgroundColor: C.primaryLighter },
  verifyBtn: {
    backgroundColor: C.primary, borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    paddingHorizontal: Spacing.xxxl + Spacing.xl,
    marginBottom: Spacing.base,
  },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: '#FFFFFF' },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  resendLink: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
});
