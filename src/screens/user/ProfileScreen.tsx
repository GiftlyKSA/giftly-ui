import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '../../api/client';
import { getWallet, updateMe } from '../../api/giftly';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';
import { Lang } from '../../i18n/strings';

interface ProfileScreenProps {
  isAgent?: boolean;
  onBack?: () => void;
  onLogout: () => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ isAgent = false, onBack, onLogout }) => {
  const { C, isDark, toggle } = useTheme();
  const { t, lang, setLanguage } = useLanguage();
  const { profile, signOut, updateCachedProfile } = useAuth();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const topPadding = useTopInset();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  useEffect(() => {
    setName(profile?.full_name || '');
    setEmail(profile?.email || '');
  }, [profile?.email, profile?.full_name]);

  const walletQuery = useQuery({ queryKey: ['wallet'], queryFn: ({ signal }) => getWallet(signal) });
  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: updated => {
      updateCachedProfile(updated);
      if (mounted.current) {
        setEditVisible(false);
        setError('');
      }
    },
    onError: updateError => {
      if (mounted.current) setError(getErrorMessage(updateError));
    },
  });

  const save = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    updateMutation.mutate({ full_name: trimmedName, email: trimmedEmail || null });
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      await onLogout();
    } finally {
      if (mounted.current) setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        {onBack ? <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backIcon}>{t.back_arrow}</Text></TouchableOpacity> : <View style={styles.headerSpacer} />}
        <Text style={styles.headerTitle}>{t.profile_title}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)}><Text style={styles.editText}>{t.profile_edit}</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.full_name || 'G').charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.userName}>{profile?.full_name || 'Giftly user'}</Text>
          <Text style={styles.userPhone}>{profile?.phone || ''}</Text>
          {isAgent ? <View style={styles.ratingRow}><Text style={styles.ratingStars}>★ {profile?.rating || '0.00'}</Text><Text style={styles.ratingCount}>({profile?.rating_count || 0} ratings)</Text></View> : null}
          <Text style={styles.accountStatus}>{profile?.status === 'ACTIVE' ? 'Active account' : 'Verification pending'}</Text>
        </View>

        <Section title={t.profile_account} C={C} isRTL={isRTL}>
          <MenuItem C={C} isRTL={isRTL} icon="@" label={t.profile_email} value={profile?.email || 'Not provided'} />
          <Divider C={C} />
          <MenuItem C={C} isRTL={isRTL} icon="$" label="Wallet available" value={walletQuery.isLoading ? 'Loading…' : walletQuery.data ? `${walletQuery.data.available} ${walletQuery.data.currency}` : 'Unavailable'} />
          {walletQuery.isError ? <Text style={styles.inlineError}>{getErrorMessage(walletQuery.error)}</Text> : null}
        </Section>

        <Section title={t.profile_prefs} C={C} isRTL={isRTL}>
          <View style={styles.toggleItem}>
            <View style={styles.toggleText}><Text style={styles.menuIcon}>◐</Text><Text style={styles.menuLabel}>{t.profile_dark}</Text></View>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ true: C.primary }} thumbColor={C.white} />
          </View>
          <Divider C={C} />
          <MenuItem C={C} isRTL={isRTL} icon="◌" label={t.profile_lang} value={lang === 'ar' ? t.lang_ar : t.lang_en} onPress={() => setLangModalVisible(true)} />
        </Section>

        <Section title={t.profile_support} C={C} isRTL={isRTL}>
          <Text style={styles.supportNote}>Support, legal pages, address management, payment methods, and account deletion require additional backend contracts before they can be enabled.</Text>
        </Section>

        <View style={styles.section}>
          <View style={styles.card}><MenuItem C={C} isRTL={isRTL} icon="→" label={isLoggingOut ? 'Signing out…' : t.profile_logout} onPress={() => void logout()} danger /></View>
        </View>
        <Text style={styles.version}>{t.profile_version}</Text>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <Text style={styles.modalLabel}>{t.reg_name}</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={120} placeholderTextColor={C.gray500} editable={!updateMutation.isPending} />
            <Text style={styles.modalLabel}>{t.reg_email}</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" maxLength={255} placeholderTextColor={C.gray500} editable={!updateMutation.isPending} />
            {error ? <Text style={styles.inlineError}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setEditVisible(false)} disabled={updateMutation.isPending}><Text style={styles.cancelModalText}>{t.btn_cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={updateMutation.isPending}><Text style={styles.saveText}>{updateMutation.isPending ? 'Saving…' : t.btn_done}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={langModalVisible} transparent animationType="fade" onRequestClose={() => setLangModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setLangModalVisible(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t.lang_title}</Text>
            {(['ar', 'en'] as Lang[]).map(option => (
              <TouchableOpacity key={option} style={[styles.langOption, lang === option && styles.langOptionActive]} onPress={() => { setLangModalVisible(false); if (option !== lang) setLanguage(option); }}>
                <Text style={[styles.langOptionText, lang === option && styles.langOptionTextActive]}>{option === 'ar' ? t.lang_ar : t.lang_en}</Text>
                {lang === option ? <Text style={styles.langCheck}>✓</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const Section: React.FC<React.PropsWithChildren<{ title: string; C: ThemeColors; isRTL: boolean }>> = ({ title, children, C, isRTL }) => (
  <View style={sectionStyles.section}><Text style={[sectionStyles.title, { color: C.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text><View style={[sectionStyles.card, Shadow.card, { backgroundColor: C.white }]}>{children}</View></View>
);

const sectionStyles = StyleSheet.create({ section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base }, title: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, marginBottom: Spacing.sm }, card: { borderRadius: Radius.xl, overflow: 'hidden' } });

const Divider: React.FC<{ C: ThemeColors }> = ({ C }) => <View style={{ height: 1, backgroundColor: C.gray100, marginHorizontal: Spacing.base }} />;

const MenuItem: React.FC<{ C: ThemeColors; icon: string; label: string; onPress?: () => void; value?: string; danger?: boolean; isRTL: boolean }> = ({ C, icon, label, onPress, value, danger = false, isRTL }) => (
  <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
    <View style={[menuStyles.iconWrap, { backgroundColor: danger ? 'rgba(219,13,13,0.1)' : C.primaryLighter }]}><Text style={menuStyles.icon}>{icon}</Text></View>
    <Text style={[menuStyles.label, { color: danger ? C.error : C.black, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
    {value ? <Text style={[menuStyles.value, { color: C.textSecondary }]} numberOfLines={1}>{value}</Text> : null}
    {onPress ? <Text style={[menuStyles.arrow, { color: danger ? C.error : C.gray400 }]}>›</Text> : null}
  </TouchableOpacity>
);

const menuStyles = StyleSheet.create({ item: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.sm }, iconWrap: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }, icon: { fontSize: 16 }, label: { flex: 1, fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base }, value: { maxWidth: '45%', fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm }, arrow: { fontSize: 22 } });

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg }, backBtn: { padding: Spacing.sm }, backIcon: { fontSize: 20, color: C.primary }, headerSpacer: { width: 36 }, headerTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.black }, editBtn: { padding: Spacing.sm }, editText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.primary },
  scroll: { paddingBottom: 40 }, avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: C.white, marginBottom: Spacing.base }, avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.primaryLighter, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.primaryLight, marginBottom: Spacing.base }, avatarText: { fontFamily: Fonts.inter.bold, fontSize: FontSize.xxl, color: C.primary }, userName: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.lg, color: C.black, marginBottom: 4 }, userPhone: { fontFamily: Fonts.inter.regular, fontSize: FontSize.base, color: C.textSecondary, marginBottom: Spacing.sm }, ratingRow: { flexDirection: 'row', gap: Spacing.sm }, ratingStars: { fontFamily: Fonts.tajawal.bold, color: '#B7791F' }, ratingCount: { fontFamily: Fonts.tajawal.regular, color: C.textSecondary }, accountStatus: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.success, marginTop: Spacing.sm },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.base }, card: { backgroundColor: C.white, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card }, toggleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base }, toggleText: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, menuIcon: { fontSize: 16 }, menuLabel: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black }, inlineError: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.error, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, textAlign: isRTL ? 'right' : 'left' }, supportNote: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.textSecondary, lineHeight: 20, padding: Spacing.base, textAlign: isRTL ? 'right' : 'left' }, version: { fontFamily: Fonts.inter.regular, fontSize: FontSize.sm, color: C.gray500, textAlign: 'center', marginTop: Spacing.base, marginBottom: Spacing.xl },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }, modal: { backgroundColor: C.white, borderRadius: Radius.xl, padding: Spacing.xl, width: '100%', maxWidth: 420, ...Shadow.card }, modalTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.black, textAlign: 'center', marginBottom: Spacing.base }, modalLabel: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.sm, color: C.black, marginBottom: Spacing.xs }, input: { borderWidth: 1, borderColor: C.gray200, borderRadius: Radius.lg, fontFamily: Fonts.tajawal.regular, color: C.black, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, marginBottom: Spacing.base }, modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm }, cancelModalBtn: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm }, cancelModalText: { fontFamily: Fonts.tajawal.bold, color: C.textSecondary }, saveBtn: { backgroundColor: C.primaryButton, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm }, saveText: { fontFamily: Fonts.tajawal.bold, color: '#FFFFFF' }, langOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderRadius: Radius.lg, marginBottom: Spacing.xs }, langOptionActive: { backgroundColor: C.primaryLighter }, langOptionText: { fontFamily: Fonts.tajawal.regular, color: C.black }, langOptionTextActive: { fontFamily: Fonts.tajawal.bold, color: C.primary }, langCheck: { color: C.primary, fontFamily: Fonts.inter.bold },
});
