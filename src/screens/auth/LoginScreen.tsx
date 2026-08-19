import React, { useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

interface LoginScreenProps {
  onLogin: (phone: string) => Promise<void>;
}

const normalizeSaudiPhone = (input: string): string | null => {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('966') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;
  return /^5\d{8}$/.test(local) ? `+966${local}` : null;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const mounted = useRef(true);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => () => {
    mounted.current = false;
  }, []);

  const submit = async () => {
    const normalized = normalizeSaudiPhone(phone);
    if (!normalized) {
      setError('Enter a valid Saudi mobile number beginning with 5.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onLogin(normalized);
    } catch (submissionError) {
      if (mounted.current) setError(getErrorMessage(submissionError));
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}><Text style={styles.logoText}>G</Text></View>
            <Text style={styles.appName}>Giftly</Text>
          </View>
          <Text style={styles.tagline}>{t.login_tagline}</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>{t.login_phone_label}</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}><Text style={styles.prefixText}>+966</Text></View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={value => setPhone(value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="5xxxxxxxx"
                keyboardType="phone-pad"
                textAlign={isRTL ? 'right' : 'left'}
                placeholderTextColor={C.gray500}
                maxLength={12}
                autoComplete="tel"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
            onPress={submit}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text style={styles.loginBtnText}>{isSubmitting ? 'Sending code…' : t.login_btn}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxxl + 20 },
  logoWrap: { alignItems: 'center', marginBottom: 4 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primaryLighter, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  logoText: { fontFamily: Fonts.inter.bold, fontSize: 36, color: C.primary },
  appName: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.xxl, color: C.primary },
  tagline: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary, marginBottom: Spacing.xxl + 16, textAlign: isRTL ? 'right' : 'center' },
  fieldWrap: { marginBottom: Spacing.base },
  label: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.black, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: C.gray200, borderRadius: Radius.lg, backgroundColor: C.white, overflow: 'hidden' },
  input: { flex: 1, fontFamily: Fonts.inter.regular, fontSize: FontSize.base, color: C.black, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  prefix: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderRightWidth: 1, borderRightColor: C.gray200 },
  prefixText: { fontFamily: Fonts.inter.regular, fontSize: FontSize.sm, color: C.textSecondary },
  error: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.error, marginBottom: Spacing.base, textAlign: isRTL ? 'right' : 'left' },
  loginBtn: { backgroundColor: C.primaryButton, borderRadius: Radius.lg, paddingVertical: Spacing.base + 2, alignItems: 'center' },
  loginBtnDisabled: { opacity: 0.55 },
  loginBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: '#FFFFFF' },
});
