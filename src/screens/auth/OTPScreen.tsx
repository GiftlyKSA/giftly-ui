import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';

I18nManager.forceRTL(true);

interface OTPScreenProps {
  phone?: string;
  onVerify: () => void;
  onResend: () => void;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
  phone = '05xxxxxxxx',
  onVerify,
  onResend,
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    const updated = [...otp];
    updated[idx] = val.slice(-1);
    setOtp(updated);
    if (val && idx < 3) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <View style={styles.root}>
      {/* Top purple arc */}
      <View style={styles.topArc} />

      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>التحقق من الرقم</Text>
        <Text style={styles.subtitle}>
          أدخل رمز التحقق المرسل إلى{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => (inputs.current[idx] = r)}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              value={digit}
              onChangeText={v => handleChange(v, idx)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]}
          onPress={onVerify}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyBtnText}>تحقق</Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>لم تستلم الرمز؟ </Text>
          <TouchableOpacity onPress={onResend}>
            <Text style={styles.resendLink}>إعادة الإرسال</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  topArc: {
    position: 'absolute',
    top: -80,
    left: -60,
    right: -60,
    height: 280,
    borderRadius: 200,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  icon: { fontSize: 56, marginBottom: Spacing.base },
  title: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxl,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  phone: {
    fontFamily: Fonts.tajawal.bold,
    color: Colors.primary,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.xxl,
  },
  otpBox: {
    width: 56,
    height: 64,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
    fontFamily: Fonts.inter.bold,
    fontSize: FontSize.xxl,
    color: Colors.black,
    backgroundColor: Colors.gray100,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLighter,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    paddingHorizontal: Spacing.xxxl + Spacing.xl,
    marginBottom: Spacing.base,
  },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
});
