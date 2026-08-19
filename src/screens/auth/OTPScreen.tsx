import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { getErrorMessage } from '../../api/client';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface OTPScreenProps {
  phone: string;
  expiresIn: number;
  developmentOtp: string | null;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
  phone,
  expiresIn,
  developmentOtp,
  onVerify,
  onResend,
}) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const changeDigit = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = Array(6).fill('');
      digits.slice(0, 6).split('').forEach((digit, digitIndex) => { next[digitIndex] = digit; });
      setOtp(next);
      inputs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    const next = [...otp];
    next[index] = digits;
    setOtp(next);
    if (digits && index < 5) inputs.current[index + 1]?.focus();
  };

  const onKeyPress = (key: string, index: number) => {
    if (key !== 'Backspace' || otp[index]) return;
    if (index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const submit = async () => {
    const code = otp.join('');
    if (!/^\d{6}$/.test(code)) return;
    setError('');
    setIsVerifying(true);
    try {
      await onVerify(code);
    } catch (verificationError) {
      if (mounted.current) setError(getErrorMessage(verificationError));
    } finally {
      if (mounted.current) setIsVerifying(false);
    }
  };

  const resend = async () => {
    setError('');
    setIsResending(true);
    try {
      await onResend();
      if (mounted.current) {
        setOtp(Array(6).fill(''));
        inputs.current[0]?.focus();
      }
    } catch (resendError) {
      if (mounted.current) setError(getErrorMessage(resendError));
    } finally {
      if (mounted.current) setIsResending(false);
    }
  };

  const complete = otp.every(Boolean);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.root}>
        <View style={styles.topArc} />
        <View style={styles.content}>
          <Text style={styles.icon}>⌁</Text>
          <Text style={styles.title}>{t.otp_title}</Text>
          <Text style={styles.subtitle}>{t.otp_subtitle}{'\n'}<Text style={styles.phone}>{phone}</Text></Text>
          <Text style={styles.expiry}>The code expires in about {Math.ceil(expiresIn / 60)} minutes.</Text>
          {developmentOtp ? (
            <View style={styles.developmentOtpCard}>
              <Text style={styles.developmentOtpLabel}>Development API OTP</Text>
              <Text selectable style={styles.developmentOtpValue}>{developmentOtp}</Text>
            </View>
          ) : null}

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputs.current[index] = ref; }}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                value={digit}
                onChangeText={value => changeDigit(value, index)}
                onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={6}
                textAlign="center"
                caretHidden
                editable={!isVerifying && !isResending}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.verifyBtn, (!complete || isVerifying) && styles.disabled]} onPress={submit} disabled={!complete || isVerifying || isResending}>
            <Text style={styles.verifyBtnText}>{isVerifying ? 'Verifying…' : t.otp_btn}</Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>{t.otp_no_code}</Text>
            <TouchableOpacity onPress={resend} disabled={isResending || isVerifying}>
              <Text style={[styles.resendLink, (isResending || isVerifying) && styles.resendDisabled]}>{isResending ? 'Sending…' : t.otp_resend}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  topArc: { position: 'absolute', top: -80, left: -60, right: -60, height: 280, borderRadius: 200, backgroundColor: C.primary, opacity: 0.08 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  icon: { fontSize: 56, marginBottom: Spacing.base, color: C.primary },
  title: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.xxl, color: C.black, marginBottom: Spacing.sm },
  subtitle: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary, textAlign: 'center', lineHeight: 24 },
  phone: { fontFamily: Fonts.inter.bold, color: C.primary },
  expiry: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  developmentOtpCard: { alignItems: 'center', backgroundColor: C.primaryLighter, borderColor: C.primaryLight, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.base, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  developmentOtpLabel: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.xs, color: C.primary },
  developmentOtpValue: { fontFamily: Fonts.inter.bold, fontSize: FontSize.xl, color: C.black, letterSpacing: 4, marginTop: 2 },
  otpRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.base },
  otpBox: { width: 46, height: 60, borderRadius: Radius.lg, borderWidth: 2, borderColor: C.gray200, fontFamily: Fonts.inter.bold, fontSize: FontSize.xl, color: C.black, backgroundColor: C.gray100 },
  otpBoxFilled: { borderColor: C.primary, backgroundColor: C.primaryLighter },
  error: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.error, textAlign: 'center', marginBottom: Spacing.base },
  verifyBtn: { backgroundColor: C.primaryButton, borderRadius: Radius.lg, paddingVertical: Spacing.base + 2, paddingHorizontal: Spacing.xxxl + Spacing.xl, marginBottom: Spacing.base },
  disabled: { opacity: 0.5 },
  verifyBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: '#FFFFFF' },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  resendLink: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
  resendDisabled: { opacity: 0.55 },
});
