import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../api/giftly';
import { getErrorMessage } from '../../api/client';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';

const CITIES = ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Khobar', 'Taif', 'Tabuk', 'Abha', 'Qassim'];
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const MAX_DATE = new Date(TODAY);
MAX_DATE.setMonth(MAX_DATE.getMonth() + 6);

interface Props {
  onCreated: (orderId: string) => void;
  onBack: () => void;
}

const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

export const CreateOrderScreen: React.FC<Props> = ({ onCreated, onBack }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const topPadding = useTopInset();
  const queryClient = useQueryClient();
  const mounted = useRef(true);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(TODAY);
  const [locationState, setLocationState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [error, setError] = useState('');

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: order => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      onCreated(order.id);
    },
    onError: mutationError => {
      if (mounted.current) setError(getErrorMessage(mutationError));
    },
  });

  const requestLocation = async () => {
    setError('');
    setLocationState('loading');
    try {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission is required to place a delivery request.');
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!mounted.current) return;
      setCoordinates({ latitude: current.coords.latitude, longitude: current.coords.longitude });
      setLocationState('ready');
    } catch (locationError) {
      if (mounted.current) {
        setLocationState('idle');
        setError(locationError instanceof Error ? locationError.message : 'Unable to get your location.');
      }
    }
  };

  const submit = () => {
    if (!city || !deliveryDate || !coordinates || createMutation.isPending) return;
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 2000) {
      setError('Description must be 2,000 characters or fewer.');
      return;
    }
    setError('');
    createMutation.mutate({
      description: trimmedDescription || null,
      delivery_city: city,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      delivery_date: toApiDate(deliveryDate),
      request_media_keys: [],
    });
  };

  const canSubmit = Boolean(city && deliveryDate && coordinates && !createMutation.isPending);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} disabled={createMutation.isPending}>
            <Text style={styles.backIcon}>{t.back_arrow}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.create_title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hintCard}>
            <Text style={styles.hintIcon}>i</Text>
            <Text style={styles.hintText}>{t.create_hint}</Text>
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t.create_desc}</Text>
              <Text style={styles.optionalTag}>{t.create_optional}</Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder={t.create_desc_ph}
              multiline
              numberOfLines={4}
              maxLength={2000}
              textAlignVertical="top"
              textAlign={isRTL ? 'right' : 'left'}
              placeholderTextColor={C.gray500}
              editable={!createMutation.isPending}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>{t.create_city}</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => setShowCityModal(true)} disabled={createMutation.isPending}>
              <Text style={styles.selectArrow}>⌄</Text>
              <Text style={[styles.selectText, !city && styles.placeholder]}>{city || t.create_city_ph}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>{t.create_date}</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => { setTempDate(deliveryDate ?? TODAY); setShowDatePicker(true); }}
              disabled={createMutation.isPending}
            >
              <Ionicons name="calendar-outline" size={18} color={C.gray500} />
              <Text style={[styles.selectText, !deliveryDate && styles.placeholder]}>{deliveryDate ? formatDate(deliveryDate, lang) : t.create_date_ph}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Delivery location</Text>
            <TouchableOpacity
              style={[styles.locationBtn, locationState === 'ready' && styles.locationReady]}
              onPress={requestLocation}
              disabled={locationState === 'loading' || createMutation.isPending}
            >
              <Text style={[styles.locationText, locationState === 'ready' && styles.locationTextReady]}>
                {locationState === 'loading' ? 'Getting your location…' : locationState === 'ready' ? 'Location confirmed' : 'Use my current location'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.locationNote}>Your coordinates are sent only to match and fulfill this delivery request.</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} onPress={submit} activeOpacity={0.85} disabled={!canSubmit}>
            <Text style={styles.submitBtnText}>{createMutation.isPending ? 'Creating request…' : t.create_submit}</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showCityModal} transparent animationType="slide" onRequestClose={() => setShowCityModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowCityModal(false)}><Text style={styles.modalClose}>{t.btn_close}</Text></TouchableOpacity>
                <Text style={styles.modalTitle}>{t.create_city_modal}</Text>
                <View style={styles.modalSpacer} />
              </View>
              <FlatList
                data={CITIES}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[styles.cityRow, city === item && styles.cityRowActive]} onPress={() => { setCity(item); setShowCityModal(false); }}>
                    <Text style={styles.cityCheck}>{city === item ? '✓' : ''}</Text>
                    <Text style={[styles.cityName, city === item && styles.cityNameActive]}>{item}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </Modal>

        {showDatePicker && Platform.OS === 'android' ? (
          <DateTimePicker value={tempDate} mode="date" display="default" minimumDate={TODAY} maximumDate={MAX_DATE} onChange={(_event, selected) => { setShowDatePicker(false); if (selected) setDeliveryDate(selected); }} />
        ) : null}

        {Platform.OS === 'ios' ? (
          <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={styles.modalCancel}>{t.btn_cancel}</Text></TouchableOpacity>
                  <Text style={styles.modalTitle}>{t.create_date_modal}</Text>
                  <TouchableOpacity onPress={() => { setDeliveryDate(tempDate); setShowDatePicker(false); }}><Text style={styles.modalDone}>{t.btn_done}</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={tempDate} mode="date" display="spinner" minimumDate={TODAY} maximumDate={MAX_DATE} onChange={(_event, selected) => selected && setTempDate(selected)} style={styles.iosPicker} locale={lang} />
              </View>
            </View>
          </Modal>
        ) : null}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base },
  backBtn: { width: 40, alignItems: isRTL ? 'flex-end' : 'flex-start' },
  backIcon: { fontSize: 22, color: C.primary },
  headerTitle: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.lg, color: C.black },
  headerSpacer: { width: 40 },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  hintCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.primaryLighter, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.xl, gap: Spacing.sm, borderWidth: 1, borderColor: C.primaryLight },
  hintIcon: { fontFamily: Fonts.inter.bold, color: C.primary, fontSize: 18 },
  hintText: { flex: 1, fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.primary, textAlign: isRTL ? 'right' : 'left', lineHeight: 20 },
  fieldWrap: { marginBottom: Spacing.xl },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  label: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.black, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.xs },
  optionalTag: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, color: C.textSecondary, marginBottom: Spacing.xs },
  textArea: { borderWidth: 2, borderColor: C.gray200, borderRadius: Radius.lg, fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.md, minHeight: 110, backgroundColor: C.white },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs, borderWidth: 2, borderColor: C.gray200, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, backgroundColor: C.white },
  selectText: { flex: 1, fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black, textAlign: isRTL ? 'right' : 'left' },
  placeholder: { color: C.gray500 },
  selectArrow: { fontSize: 14, color: C.gray500 },
  locationBtn: { borderWidth: 2, borderColor: C.primaryLight, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, backgroundColor: C.primaryLighter, alignItems: 'center' },
  locationReady: { backgroundColor: C.infoBg, borderColor: C.info },
  locationText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
  locationTextReady: { color: C.info },
  locationNote: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, color: C.textSecondary, marginTop: Spacing.xs, textAlign: isRTL ? 'right' : 'left' },
  error: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.error, textAlign: isRTL ? 'right' : 'left', marginBottom: Spacing.base },
  submitBtn: { backgroundColor: C.primaryButton, borderRadius: Radius.lg, paddingVertical: Spacing.base + 2, alignItems: 'center', marginTop: Spacing.sm, ...Shadow.card },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: '#FFFFFF' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: Radius.xl + 4, borderTopRightRadius: Radius.xl + 4, paddingBottom: Spacing.xxxl, maxHeight: '70%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.gray300, alignSelf: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xs },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  modalTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.black },
  modalClose: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  modalCancel: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary },
  modalDone: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.primary },
  modalSpacer: { width: 24 },
  cityRow: { flexDirection: isRTL ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: isRTL ? 'flex-end' : 'flex-start', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md + 2 },
  cityRowActive: { backgroundColor: C.primaryLighter },
  cityName: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black, textAlign: isRTL ? 'right' : 'left' },
  cityNameActive: { fontFamily: Fonts.tajawal.bold, color: C.primary },
  cityCheck: { fontFamily: Fonts.inter.bold, fontSize: FontSize.base, color: C.primary, marginLeft: isRTL ? Spacing.sm : 0, marginRight: isRTL ? 0 : Spacing.sm, width: 20 },
  separator: { height: 1, backgroundColor: C.gray100, marginHorizontal: Spacing.xl },
  iosPicker: { width: '100%' },
});
