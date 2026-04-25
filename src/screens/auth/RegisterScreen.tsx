import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  TextInput, I18nManager, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

I18nManager.forceRTL(true);

interface RegisterScreenProps {
  onRegister: () => void;
  onGoLogin: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const MAX_DATE = new Date();
const MIN_DATE = new Date(1900, 0, 1);

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onGoLogin }) => {
  const { C } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(C), [C]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1));

  const handleAndroidChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(false);
    if (selected) setDob(selected);
  };

  const handleIosChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const confirmIos = () => {
    setDob(tempDate);
    setShowPicker(false);
  };

  const openPicker = () => {
    setTempDate(dob ?? new Date(2000, 0, 1));
    setShowPicker(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={onGoLogin} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back_arrow}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t.reg_title}</Text>
        <Text style={styles.subtitle}>{t.reg_subtitle}</Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>{t.reg_name}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t.reg_name_ph}
            textAlign="right"
            placeholderTextColor={C.gray500}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>{t.reg_phone}</Text>
          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇸🇦 +966</Text>
            </View>
            <TextInput
              style={styles.inputInRow}
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

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>{t.reg_email}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            textAlign="right"
            autoCapitalize="none"
            placeholderTextColor={C.gray500}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>{t.reg_dob}</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={openPicker} activeOpacity={0.7}>
            <Text style={[styles.dateBtnText, !dob && styles.datePlaceholder]}>
              {dob ? formatDate(dob) : 'DD MMM YYYY'}
            </Text>
            <Text style={styles.calIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {showPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            maximumDate={MAX_DATE}
            minimumDate={MIN_DATE}
            onChange={handleAndroidChange}
          />
        )}

        {Platform.OS === 'ios' && (
          <Modal
            visible={showPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalCancel}>{t.btn_cancel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t.reg_dob}</Text>
                  <TouchableOpacity onPress={confirmIos}>
                    <Text style={styles.modalDone}>{t.btn_done}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  maximumDate={MAX_DATE}
                  minimumDate={MIN_DATE}
                  onChange={handleIosChange}
                  style={styles.iosPicker}
                  locale="ar"
                />
              </View>
            </View>
          </Modal>
        )}

        <View style={styles.termsRow}>
          <Text style={styles.termsText}>{t.reg_terms1}</Text>
          <TouchableOpacity><Text style={styles.termsLink}>{t.reg_terms2}</Text></TouchableOpacity>
          <Text style={styles.termsText}>{t.reg_terms3}</Text>
          <TouchableOpacity><Text style={styles.termsLink}>{t.reg_terms4}</Text></TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={onRegister}
          activeOpacity={0.85}
        >
          <Text style={styles.registerBtnText}>{t.reg_btn}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginRow} onPress={onGoLogin}>
          <Text style={styles.loginText}>{t.reg_have_account}</Text>
          <Text style={styles.loginLink}>{t.reg_signin}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxxl },
  backBtn: { marginBottom: Spacing.base },
  backText: { fontSize: 22, color: C.primary },
  title: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.xxl,
    color: C.black,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.xl,
  },
  fieldWrap: { marginBottom: Spacing.base },
  label: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: C.gray200,
    borderRadius: Radius.lg,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    textAlign: 'right',
    backgroundColor: C.white,
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
  inputInRow: {
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
  dateBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: C.gray200,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: C.white,
  },
  dateBtnText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
  },
  datePlaceholder: { color: C.gray500 },
  calIcon: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  modalTitle: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
  },
  modalCancel: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
  modalDone: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.primary,
  },
  iosPicker: { width: '100%' },
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: Spacing.base,
  },
  termsText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.textSecondary,
  },
  termsLink: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  registerBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  registerBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: '#FFFFFF',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  loginText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.textSecondary,
  },
  loginLink: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.primary,
  },
});
