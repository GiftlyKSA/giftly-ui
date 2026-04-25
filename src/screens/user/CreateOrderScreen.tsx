import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, FlatList, KeyboardAvoidingView,
  Platform, I18nManager,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';

I18nManager.forceRTL(true);

const CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
  'الخبر', 'الطائف', 'تبوك', 'أبها', 'القصيم',
];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const MAX_DATE = new Date(TODAY.getFullYear() + 1, TODAY.getMonth(), TODAY.getDate());

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

interface Props {
  onSubmit: () => void;
  onBack: () => void;
}

export const CreateOrderScreen: React.FC<Props> = ({ onSubmit, onBack }) => {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const topPadding = useTopInset();

  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(TODAY);

  const canSubmit = city !== '' && deliveryDate !== null;

  const handleAndroidDate = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) setDeliveryDate(selected);
  };

  const handleIosDate = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>→</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>طلب جديد</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hintCard}>
          <Text style={styles.hintIcon}>💡</Text>
          <Text style={styles.hintText}>
            لا تعرف ماذا تطلب؟ أخبرنا عن المناسبة فقط وسيساعدك خبراؤنا في اختيار الهدية المثالية!
          </Text>
        </View>

        {/* Description - optional */}
        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Text style={styles.optionalTag}>اختياري</Text>
            <Text style={styles.label}>وصف الطلب</Text>
          </View>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={'اكتب تفاصيل المناسبة أو ما تريد إهداءه...\nمثال: هدية عيد ميلاد لصديق عمره ٢٥ سنة'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign="right"
            placeholderTextColor={C.gray500}
          />
        </View>

        {/* City */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>المدينة</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectArrow}>▾</Text>
            <Text style={[styles.selectText, !city && styles.placeholder]}>
              {city || 'اختر المدينة'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Date */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>تاريخ التسليم</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => {
              setTempDate(deliveryDate ?? TODAY);
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.calIcon}>📅</Text>
            <Text style={[styles.selectText, !deliveryDate && styles.placeholder]}>
              {deliveryDate ? formatDate(deliveryDate) : 'اختر تاريخ التسليم'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            minimumDate={TODAY}
            maximumDate={MAX_DATE}
            onChange={handleAndroidDate}
          />
        )}

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={canSubmit ? onSubmit : undefined}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>إرسال الطلب</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* City Modal */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>اختر المدينة</Text>
              <View style={{ width: 24 }} />
            </View>
            <FlatList
              data={CITIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.cityRow, city === item && styles.cityRowActive]}
                  onPress={() => { setCity(item); setShowCityModal(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cityCheck}>{city === item ? '✓' : ''}</Text>
                  <Text style={[styles.cityName, city === item && styles.cityNameActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

      {/* iOS Date Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>إلغاء</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>تاريخ التسليم</Text>
                <TouchableOpacity onPress={() => { setDeliveryDate(tempDate); setShowDatePicker(false); }}>
                  <Text style={styles.modalDone}>تم</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={TODAY}
                maximumDate={MAX_DATE}
                onChange={handleIosDate}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    ...Shadow.header,
  },
  backBtn: { width: 40, alignItems: 'flex-end' },
  backIcon: { fontSize: 22, color: C.primary },
  headerTitle: {
    fontFamily: Fonts.tajawal.extraBold,
    fontSize: FontSize.lg,
    color: C.black,
  },

  scroll: { padding: Spacing.xl, paddingBottom: 40 },

  hintCard: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: C.primaryLighter,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  hintIcon: { fontSize: 20, marginTop: 1 },
  hintText: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.primary,
    textAlign: 'right',
    lineHeight: 20,
  },

  fieldWrap: { marginBottom: Spacing.xl },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  optionalTag: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.textSecondary,
    marginBottom: Spacing.xs,
  },
  textArea: {
    borderWidth: 2,
    borderColor: C.gray200,
    borderRadius: Radius.lg,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    minHeight: 110,
    textAlign: 'right',
    backgroundColor: C.white,
  },
  selectBtn: {
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
  selectText: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
  },
  placeholder: { color: C.gray500 },
  selectArrow: { fontSize: 14, color: C.gray500, marginLeft: 4 },
  calIcon: { fontSize: 18, marginLeft: 4 },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.card,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: '#FFFFFF',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: Radius.xl + 4,
    borderTopRightRadius: Radius.xl + 4,
    paddingBottom: Spacing.xxxl,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.gray300,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modalClose: { fontSize: 16, color: C.textSecondary },
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
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
  },
  cityRowActive: { backgroundColor: C.primaryLighter },
  cityName: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: 'right',
  },
  cityNameActive: {
    fontFamily: Fonts.tajawal.bold,
    color: C.primary,
  },
  cityCheck: {
    fontFamily: Fonts.inter.bold,
    fontSize: FontSize.base,
    color: C.primary,
    marginLeft: Spacing.sm,
    width: 20,
  },
  separator: { height: 1, backgroundColor: C.gray100, marginHorizontal: Spacing.xl },
});
