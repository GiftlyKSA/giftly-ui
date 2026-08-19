import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { register, sendOtp, verifyOtp } from '../api/auth';
import { RegistrationForm, UserProfile } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { extractDevelopmentOtp } from '../config/runtime';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { AgentHomeScreen } from '../screens/agent/AgentHomeScreen';
import { PendingVerificationScreen } from '../screens/agent/PendingVerificationScreen';
import { ChatScreen } from '../screens/user/ChatScreen';
import { CreateOrderScreen } from '../screens/user/CreateOrderScreen';
import { OrderTrackingScreen } from '../screens/user/OrderTrackingScreen';
import { OrdersScreen } from '../screens/user/OrdersScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';
import { UserHomeScreen } from '../screens/user/UserHomeScreen';
import { WaitingScreen } from '../screens/user/WaitingScreen';

type Screen =
  | 'onboarding'
  | 'login'
  | 'register'
  | 'otp'
  | 'user-home'
  | 'agent-home'
  | 'pending-verification'
  | 'create-order'
  | 'waiting'
  | 'user-orders'
  | 'agent-orders'
  | 'order-tracking'
  | 'chat'
  | 'user-profile'
  | 'agent-profile';

interface NavState {
  screen: Screen;
  params?: Record<string, string>;
}

interface PendingOtp {
  phone: string;
  expiresIn: number;
  developmentOtp: string | null;
}

export const RootNavigator: React.FC = () => {
  const { phase, profile, signIn, signOut } = useAuth();
  const [nav, setNav] = useState<NavState>({ screen: 'onboarding' });
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const isInitialAuthRestore = useRef(true);

  const go = (screen: Screen, params?: Record<string, string>) => setNav({ screen, params });

  const routeAuthenticated = (nextProfile: UserProfile) => {
    if (nextProfile.status === 'BANNED') {
      void signOut();
      go('login');
      return;
    }
    if (nextProfile.role === 'COURIER' && nextProfile.status === 'PENDING_VERIFICATION') {
      go('pending-verification');
      return;
    }
    go(nextProfile.role === 'COURIER' ? 'agent-home' : 'user-home');
  };

  useEffect(() => {
    if (phase !== 'authenticated' || !profile || !isInitialAuthRestore.current) return;
    isInitialAuthRestore.current = false;
    routeAuthenticated(profile);
  }, [phase, profile]);

  useEffect(() => {
    const protectedScreen = !['onboarding', 'login', 'otp', 'register'].includes(nav.screen);
    if (phase === 'guest' && protectedScreen) go('login');
  }, [nav.screen, phase]);

  const handleLogin = async (phone: string) => {
    const response = await sendOtp(phone);
    setPendingOtp({
      phone,
      expiresIn: response.expires_in,
      developmentOtp: extractDevelopmentOtp(process.env.EXPO_PUBLIC_ENVIRONMENT, response.dev_otp),
    });
    go('otp');
  };

  const handleResend = async () => {
    if (!pendingOtp) throw new Error('Start a new sign-in request first.');
    const response = await sendOtp(pendingOtp.phone);
    setPendingOtp(current => current ? {
      ...current,
      expiresIn: response.expires_in,
      developmentOtp: extractDevelopmentOtp(process.env.EXPO_PUBLIC_ENVIRONMENT, response.dev_otp),
    } : current);
  };

  const handleOtpVerify = async (otp: string) => {
    if (!pendingOtp) throw new Error('Start a new sign-in request first.');
    const response = await verifyOtp(pendingOtp.phone, otp);
    if (response.is_new_user) {
      if (!response.registration_token) throw new Error('The registration handoff was not provided.');
      setRegistrationToken(response.registration_token);
      go('register');
      return;
    }
    if (!response.access_token || !response.refresh_token || !response.role) {
      throw new Error('The sign-in response was incomplete.');
    }
    const nextProfile = await signIn({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      role: response.role,
    });
    routeAuthenticated(nextProfile);
  };

  const handleRegister = async (form: RegistrationForm) => {
    if (!registrationToken) throw new Error('Start registration again to obtain a new token.');
    const session = await register(registrationToken, form);
    setRegistrationToken(null);
    const nextProfile = await signIn(session);
    routeAuthenticated(nextProfile);
  };

  const handleTabPress = (route: string) => {
    const isCourier = profile?.role === 'COURIER';
    if (route === 'new-order') {
      if (!isCourier) go('create-order');
      return;
    }
    if (route === 'home') go(isCourier ? 'agent-home' : 'user-home');
    else if (route === 'orders') go(isCourier ? 'agent-orders' : 'user-orders');
    else if (route === 'chat') go('chat');
    else if (route === 'profile') go(isCourier ? 'agent-profile' : 'user-profile');
  };

  const goLogin = () => {
    setPendingOtp(null);
    setRegistrationToken(null);
    go('login');
  };

  if (phase === 'restoring') {
    return <View style={styles.loading}><ActivityIndicator /></View>;
  }

  const isAgent = profile?.role === 'COURIER';

  if (nav.screen === 'onboarding') return <OnboardingScreen onFinish={() => go('login')} />;
  if (nav.screen === 'login') return <LoginScreen onLogin={handleLogin} />;
  if (nav.screen === 'otp' && pendingOtp) return <OTPScreen phone={pendingOtp.phone} expiresIn={pendingOtp.expiresIn} developmentOtp={pendingOtp.developmentOtp} onVerify={handleOtpVerify} onResend={handleResend} />;
  if (nav.screen === 'register' && pendingOtp && registrationToken) return <RegisterScreen phone={pendingOtp.phone} onRegister={handleRegister} onGoLogin={goLogin} />;
  if (nav.screen === 'pending-verification') return <PendingVerificationScreen onVerified={() => go('agent-home')} onLogout={async () => goLogin()} />;
  if (nav.screen === 'user-home') return <UserHomeScreen onOrderPress={orderId => go('order-tracking', { orderId })} onTabPress={handleTabPress} />;
  if (nav.screen === 'agent-home') return <AgentHomeScreen onOrderPress={orderId => go('order-tracking', { orderId })} onTabPress={handleTabPress} />;
  if (nav.screen === 'create-order') return <CreateOrderScreen onCreated={orderId => go('waiting', { orderId })} onBack={() => go('user-home')} />;
  if (nav.screen === 'waiting' && nav.params?.orderId) return <WaitingScreen orderId={nav.params.orderId} onAssigned={orderId => go('order-tracking', { orderId })} onBackHome={() => go('user-home')} />;
  if (nav.screen === 'user-orders' || nav.screen === 'agent-orders') return <OrdersScreen isAgent={isAgent} onOrderPress={orderId => go('order-tracking', { orderId })} onTabPress={handleTabPress} />;
  if (nav.screen === 'order-tracking' && nav.params?.orderId) return <OrderTrackingScreen orderId={nav.params.orderId} isAgent={isAgent} onBack={() => go(isAgent ? 'agent-home' : 'user-home')} onChat={() => go('chat', nav.params)} />;
  if (nav.screen === 'chat') return <ChatScreen conversationId={nav.params?.conversationId} orderId={nav.params?.orderId} onBack={() => go(isAgent ? 'agent-home' : 'user-home')} />;
  if (nav.screen === 'user-profile' || nav.screen === 'agent-profile') return <ProfileScreen isAgent={isAgent} onBack={() => go(isAgent ? 'agent-home' : 'user-home')} onLogout={async () => goLogin()} />;

  return <LoginScreen onLogin={handleLogin} />;
};

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
