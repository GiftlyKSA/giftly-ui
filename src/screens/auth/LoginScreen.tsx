import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  TextInput, I18nManager,
} from 'react-native';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

I18nManager.forceRTL(true);

interface LoginScreenProps {
  onLogin: (phone: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);
  const [phone, setPhone] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🎁</Text>
          </View>
          <Text style={styles.appName}>Giftly</Text>
          <Text style={styles.tagline}>{t.login_tagline}</Text>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>{t.login_phone_label}</Text>
          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇸🇦 +966</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="5xxxxxxxx"
              keyboardType="phone-pad"
              textAlign="right"
              placeholderTextColor={C.gray500}
              maxLength={9}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, !phone && styles.loginBtnDisabled]}
          onPress={() => onLogin(phone)}
          activeOpacity={0.85}
          disabled={!phone}
        >
          <Text style={styles.loginBtnText}>{t.login_btn}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxxl + 20 },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xxl + 16 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoText: { fontSize: 36 },
  appName: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxl,
    color: C.primary,
  },
  tagline: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  fieldWrap: { marginBottom: Spacing.xl },
  label: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.gray200,
    borderRadius: Radius.lg,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    textAlign: 'right',
  },
  prefix: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: C.gray200,
  },
  prefixText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
  },
  loginBtnDisabled: { opacity: 0.45 },
  loginBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: '#FFFFFF',
  },
});
