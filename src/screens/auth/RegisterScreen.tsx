import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { getErrorMessage } from '../../api/client';
import { RegistrationForm } from '../../api/types';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { createCustomerRegistrationForm } from '../../utils/registration';

interface RegisterScreenProps {
  phone: string;
  onRegister: (form: RegistrationForm) => Promise<void>;
  onGoLogin: () => void;
}

const MAX_DATE = new Date();
const MIN_DATE = new Date(1900, 0, 1);

const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ phone, onRegister, onGoLogin }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const mounted = useRef(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const openPicker = () => {
    setTempDate(dob ?? new Date(2000, 0, 1));
    setShowPicker(true);
  };

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (trimmedName.length > 120) {
      setError('Your full name must be 120 characters or fewer.');
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onRegister(createCustomerRegistrationForm({
        fullName: trimmedName,
        email: trimmedEmail || null,
        dob: dob ? toApiDate(dob) : null,
      }));
    } catch (submissionError) {
      if (mounted.current) setError(getErrorMessage(submissionError));
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  const onAndroidDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(false);
    if (selected) setDob(selected);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={onGoLogin} style={styles.backBtn} disabled={isSubmitting}>
            <Text style={styles.backText}>{t.back_arrow}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t.reg_title}</Text>
          <Text style={styles.subtitle}>{t.reg_subtitle}</Text>

          <Field label={t.reg_name} C={C} isRTL={isRTL}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.reg_name_ph}
              placeholderTextColor={C.gray500}
              textAlign={isRTL ? 'right' : 'left'}
              maxLength={120}
              editable={!isSubmitting}
            />
          </Field>

          <Field label={t.reg_phone} C={C} isRTL={isRTL}>
            <TextInput style={[styles.input, styles.readOnly]} value={phone} editable={false} />
          </Field>

          <Field label={t.reg_email} C={C} isRTL={isRTL}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={C.gray500}
              textAlign={isRTL ? 'right' : 'left'}
              maxLength={255}
              editable={!isSubmitting}
            />
          </Field>

          <Field label={t.reg_dob} C={C} isRTL={isRTL}>
            <TouchableOpacity style={styles.dateBtn} onPress={openPicker} disabled={isSubmitting}>
              <Text style={[styles.dateBtnText, !dob && styles.datePlaceholder]}>
                {dob ? formatDate(dob, lang) : 'DD MMM YYYY'}
              </Text>
              <Text style={styles.calIcon}>◫</Text>
            </TouchableOpacity>
          </Field>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.registerBtn, isSubmitting && styles.disabled]}
            onPress={submit}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text style={styles.registerBtnText}>{isSubmitting ? 'Creating account…' : t.reg_btn}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRow} onPress={onGoLogin} disabled={isSubmitting}>
            <Text style={styles.loginText}>{t.reg_have_account}</Text>
            <Text style={styles.loginLink}>{t.reg_signin}</Text>
          </TouchableOpacity>
        </ScrollView>

        {showPicker && Platform.OS === 'android' ? (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            maximumDate={MAX_DATE}
            minimumDate={MIN_DATE}
            onChange={onAndroidDateChange}
          />
        ) : null}

        {Platform.OS === 'ios' ? (
          <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalCancel}>{t.btn_cancel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t.reg_dob}</Text>
                  <TouchableOpacity onPress={() => { setDob(tempDate); setShowPicker(false); }}>
                    <Text style={styles.modalDone}>{t.btn_done}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  maximumDate={MAX_DATE}
                  minimumDate={MIN_DATE}
                  onChange={(_event, selected) => selected && setTempDate(selected)}
                  style={styles.iosPicker}
                  locale={lang}
                />
              </View>
            </View>
          </Modal>
        ) : null}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const Field: React.FC<React.PropsWithChildren<{ label: string; C: ThemeColors; isRTL: boolean }>> = ({ label, children, C, isRTL }) => (
  <View style={fieldStyles.wrap}>
    <Text style={[fieldStyles.label, { color: C.black, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
    {children}
  </View>
);

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.base },
  label: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, marginBottom: Spacing.xs },
});

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxxl, flexGrow: 1 },
  backBtn: { marginBottom: Spacing.base },
  backText: { fontSize: 22, color: C.primary },
  title: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.xxl, color: C.black, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.xs },
  subtitle: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.xl },
  input: { borderWidth: 2, borderColor: C.gray200, borderRadius: Radius.lg, fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: C.white },
  readOnly: { backgroundColor: C.gray100, color: C.textSecondary },
  dateBtn: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderColor: C.gray200, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: C.white },
  dateBtnText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black },
  datePlaceholder: { color: C.gray500 },
  calIcon: { fontSize: 18 },
  error: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.error, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.base },
  registerBtn: { backgroundColor: C.primaryButton, borderRadius: Radius.lg, paddingVertical: Spacing.base + 2, alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.base },
  disabled: { opacity: 0.55 },
  registerBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: '#FFFFFF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
  loginText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  loginLink: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingBottom: Spacing.xxxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  modalTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.black },
  modalCancel: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  modalDone: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
  iosPicker: { width: '100%' },
});
