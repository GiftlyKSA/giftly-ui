import React, { useState } from 'react';
import { I18nManager } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { UserHomeScreen } from '../screens/user/UserHomeScreen';
import { AgentHomeScreen } from '../screens/agent/AgentHomeScreen';
import { OrderTrackingScreen } from '../screens/user/OrderTrackingScreen';
import { OrdersScreen } from '../screens/user/OrdersScreen';
import { ChatScreen } from '../screens/user/ChatScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';

I18nManager.forceRTL(true);

type Screen =
  | 'login' | 'register' | 'otp'
  | 'user-home' | 'agent-home'
  | 'user-orders' | 'agent-orders'
  | 'order-tracking' | 'chat'
  | 'user-profile' | 'agent-profile';

interface NavState {
  screen: Screen;
  params?: Record<string, string>;
}

export const RootNavigator: React.FC = () => {
  const [nav, setNav] = useState<NavState>({ screen: 'login' });
  const [role, setRole] = useState<'user' | 'agent'>('user');

  const go = (screen: Screen, params?: Record<string, string>) =>
    setNav({ screen, params });

  const handleLogin = (r: 'user' | 'agent') => {
    setRole(r);
    go('otp');
  };

  const handleOtpVerify = () => {
    go(role === 'agent' ? 'agent-home' : 'user-home');
  };

  const handleTabPress = (route: string) => {
    if (role === 'user') {
      if (route === 'home') go('user-home');
      else if (route === 'orders') go('user-orders');
      else if (route === 'chat') go('chat');
      else if (route === 'profile') go('user-profile');
    } else {
      if (route === 'home') go('agent-home');
      else if (route === 'orders') go('agent-orders');
      else if (route === 'profile') go('agent-profile');
    }
  };

  const { screen, params } = nav;

  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoRegister={() => go('register')}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onRegister={() => go('otp')}
        onGoLogin={() => go('login')}
      />
    );
  }

  if (screen === 'otp') {
    return (
      <OTPScreen
        onVerify={handleOtpVerify}
        onResend={() => {}}
      />
    );
  }

  if (screen === 'user-home') {
    return (
      <UserHomeScreen
        onOrderPress={id => go('order-tracking', { orderId: id })}
        onTabPress={handleTabPress}
      />
    );
  }

  if (screen === 'agent-home') {
    return (
      <AgentHomeScreen
        onOrderPress={id => go('order-tracking', { orderId: id })}
        onTabPress={handleTabPress}
      />
    );
  }

  if (screen === 'user-orders' || screen === 'agent-orders') {
    return (
      <OrdersScreen
        isAgent={role === 'agent'}
        onOrderPress={id => go('order-tracking', { orderId: id })}
        onTabPress={handleTabPress}
      />
    );
  }

  if (screen === 'order-tracking') {
    return (
      <OrderTrackingScreen
        orderId={params?.orderId}
        onBack={() => go(role === 'agent' ? 'agent-home' : 'user-home')}
        onChat={() => go('chat', params)}
      />
    );
  }

  if (screen === 'chat') {
    return (
      <ChatScreen
        orderId={params?.orderId}
        onBack={() => go(role === 'agent' ? 'agent-home' : 'user-home')}
      />
    );
  }

  if (screen === 'user-profile' || screen === 'agent-profile') {
    return (
      <ProfileScreen
        isAgent={role === 'agent'}
        onBack={() => go(role === 'agent' ? 'agent-home' : 'user-home')}
        onLogout={() => go('login')}
      />
    );
  }

  return null;
};
