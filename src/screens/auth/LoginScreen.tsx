import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  TextInput, I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';

I18nManager.forceRTL(true);

interface LoginScreenProps {
  onLogin: (role: 'user' | 'agent') => void;
  onGoRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<'user' | 'agent'>('user');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🎁</Text>
          </View>
          <Text style={styles.appName}>Giftly</Text>
          <Text style={styles.tagline}>اختيارات تصنع لحظة لا تُنسى</Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.roleToggle}>
          {(['user', 'agent'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                {r === 'user' ? 'عميل' : 'خبير هدايا'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>رقم الجوال</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="05xxxxxxxx"
              keyboardType="phone-pad"
              textAlign="right"
              placeholderTextColor={Colors.gray500}
            />
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇸🇦 +966</Text>
            </View>
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>كلمة المرور</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              textAlign="right"
              placeholderTextColor={Colors.gray500}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
              <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={() => onLogin(role)} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>أو</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialBtnText}>🍎  تسجيل بحساب Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]}>
          <Text style={styles.socialBtnText}>🌐  تسجيل بحساب Google</Text>
        </TouchableOpacity>

        {/* Register link */}
        <TouchableOpacity style={styles.registerRow} onPress={onGoRegister}>
          <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
          <Text style={styles.registerLink}>إنشاء حساب</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxxl + 20 },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLighter,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoText: { fontSize: 36 },
  appName: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxl,
    color: Colors.primary,
  },
  tagline: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  roleBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  roleBtnActive: { backgroundColor: Colors.primary },
  roleBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  roleBtnTextActive: { color: Colors.white },
  fieldWrap: { marginBottom: Spacing.base },
  label: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.black,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    textAlign: 'right',
  },
  prefix: {
    paddingHorizontal: Spacing.base,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray200,
  },
  prefixText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  eyeBtn: { paddingHorizontal: Spacing.base },
  eyeText: { fontSize: 18 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.xl },
  forgotText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  loginBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
    gap: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  dividerText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  socialBtn: {
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  googleBtn: { borderColor: Colors.gray200 },
  socialBtnText: {
    fontFamily: Fonts.tajawal.medium,
    fontSize: FontSize.base,
    color: Colors.dark,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.base,
  },
  registerText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
});
