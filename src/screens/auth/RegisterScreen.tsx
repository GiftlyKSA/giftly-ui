import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, TextInput,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';

interface RegisterScreenProps {
  onRegister: () => void;
  onGoLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onGoLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'agent'>('user');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={onGoLogin} style={styles.backBtn}>
          <Text style={styles.backText}>→</Text>
        </TouchableOpacity>

        <Text style={styles.title}>إنشاء حساب جديد</Text>
        <Text style={styles.subtitle}>انضم إلى مجتمع خبراء الهدايا</Text>

        {/* Role */}
        <View style={styles.roleToggle}>
          {(['user', 'agent'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                {r === 'user' ? '👤 عميل' : '🎁 خبير هدايا'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {[
          { label: 'الاسم الكامل', value: name, setter: setName, placeholder: 'محمد أحمد', keyboard: 'default' as const },
          { label: 'رقم الجوال', value: phone, setter: setPhone, placeholder: '05xxxxxxxx', keyboard: 'phone-pad' as const },
          { label: 'البريد الإلكتروني', value: email, setter: setEmail, placeholder: 'example@email.com', keyboard: 'email-address' as const },
          { label: 'كلمة المرور', value: password, setter: setPassword, placeholder: '••••••••', keyboard: 'default' as const },
        ].map(f => (
          <View style={styles.fieldWrap} key={f.label}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={f.value}
              onChangeText={f.setter}
              placeholder={f.placeholder}
              keyboardType={f.keyboard}
              secureTextEntry={f.label === 'كلمة المرور'}
              textAlign="right"
              placeholderTextColor={Colors.gray500}
            />
          </View>
        ))}

        <View style={styles.termsRow}>
          <Text style={styles.termsText}>أوافق على </Text>
          <TouchableOpacity><Text style={styles.termsLink}>الشروط والأحكام</Text></TouchableOpacity>
          <Text style={styles.termsText}> و</Text>
          <TouchableOpacity><Text style={styles.termsLink}> سياسة الخصوصية</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={onRegister} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>إنشاء الحساب</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginRow} onPress={onGoLogin}>
          <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
          <Text style={styles.loginLink}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxxl },
  backBtn: { marginBottom: Spacing.base },
  backText: { fontSize: 22, color: Colors.primary },
  title: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxl,
    color: Colors.black,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.xl,
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
  input: {
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: Radius.lg,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.black,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    textAlign: 'right',
  },
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: Spacing.base,
  },
  termsText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  termsLink: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  registerBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  loginText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
});
