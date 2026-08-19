import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getErrorMessage } from '../../api/client';
import { ThemeColors, Spacing, Radius, Fonts, FontSize } from '../../constants/colors';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../context/ThemeContext';

interface PendingVerificationScreenProps {
  onLogout: () => Promise<void>;
  onVerified: () => void;
}

export const PendingVerificationScreen: React.FC<PendingVerificationScreenProps> = ({ onLogout, onVerified }) => {
  const { C } = useTheme();
  const { profile, refreshProfile, signOut } = useAuth();
  const styles = useMemo(() => createStyles(C), [C]);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const checkStatus = async () => {
    setError('');
    setIsChecking(true);
    try {
      const refreshed = await refreshProfile();
      if (refreshed.status === 'ACTIVE') onVerified();
    } catch (checkError) {
      if (mounted.current) setError(getErrorMessage(checkError));
    } finally {
      if (mounted.current) setIsChecking(false);
    }
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
      <View style={styles.card}>
        <Text style={styles.icon}>⌛</Text>
        <Text style={styles.title}>Courier verification pending</Text>
        <Text style={styles.body}>Your courier account for {profile?.full_name || 'this profile'} is waiting for verification. You will be able to accept delivery requests once it becomes active.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primary} onPress={checkStatus} disabled={isChecking || isLoggingOut}>
          {isChecking ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Check status</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => void logout()} disabled={isChecking || isLoggingOut}>
          <Text style={styles.secondaryText}>{isLoggingOut ? 'Signing out…' : 'Sign out'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (C: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  card: { width: '100%', maxWidth: 460, borderRadius: Radius.xl, padding: Spacing.xl, backgroundColor: C.white, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: Spacing.base }, title: { fontFamily: Fonts.tajawal.extraBold, fontSize: FontSize.xl, color: C.black, textAlign: 'center', marginBottom: Spacing.sm }, body: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.textSecondary, textAlign: 'center', lineHeight: 23, marginBottom: Spacing.base }, error: { fontFamily: Fonts.tajawal.regular, color: C.error, textAlign: 'center', marginBottom: Spacing.base }, primary: { width: '100%', backgroundColor: C.primary, borderRadius: Radius.lg, alignItems: 'center', paddingVertical: Spacing.base, marginBottom: Spacing.sm }, primaryText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: '#FFFFFF' }, secondary: { paddingVertical: Spacing.sm }, secondaryText: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.base, color: C.textSecondary },
});
