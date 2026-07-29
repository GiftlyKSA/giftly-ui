import React, { useState } from 'react';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { UserHomeScreen } from '../screens/user/UserHomeScreen';
import { AgentHomeScreen } from '../screens/agent/AgentHomeScreen';
import { CreateOrderScreen } from '../screens/user/CreateOrderScreen';
import { WaitingScreen } from '../screens/user/WaitingScreen';
import { OrderTrackingScreen } from '../screens/user/OrderTrackingScreen';
import { OrdersScreen } from '../screens/user/OrdersScreen';
import { ChatScreen } from '../screens/user/ChatScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';

type Screen =
  | 'onboarding' | 'login' | 'register' | 'otp'
  | 'user-home' | 'agent-home'
  | 'create-order' | 'waiting'
  | 'user-orders' | 'agent-orders'
  | 'order-tracking' | 'chat'
  | 'user-profile' | 'agent-profile';

interface NavState {
  screen: Screen;
  params?: Record<string, string>;
}

export const RootNavigator: React.FC = () => {
  const [nav, setNav] = useState<NavState>({ screen: 'onboarding' });
  const [role, setRole] = useState<'user' | 'agent' | 'new'>('new');
  const [loginPhone, setLoginPhone] = useState('');

  const go = (screen: Screen, params?: Record<string, string>) =>
    setNav({ screen, params });

  const handleLogin = (phone: string) => {
    const stripped = phone.replace(/\s/g, '');
    setLoginPhone(stripped);
    if (stripped === '555555555') {
      setRole('user');
    } else if (stripped === '555555558') {
      setRole('agent');
    } else {
      setRole('new');
    }
    go('otp');
  };

  const handleOtpVerify = () => {
    if (role === 'agent') go('agent-home');
    else if (role === 'user') go('user-home');
    else go('register'); // new user → fill registration form after OTP
  };

  const handleTabPress = (route: string) => {
    if (route === 'new-order') {
      if (role !== 'agent') go('create-order');
      return;
    }
    const r = role === 'agent' ? 'agent' : 'user';
    if (r === 'user') {
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

  if (screen === 'onboarding') {
    return <OnboardingScreen onFinish={() => go('login')} />;
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === 'otp') {
    return (
      <OTPScreen
        phone={`+966 ${loginPhone}`}
        onVerify={handleOtpVerify}
        onResend={() => {}}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onRegister={() => { setRole('user'); go('user-home'); }}
        onGoLogin={() => go('login')}
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

  if (screen === 'create-order') {
    return (
      <CreateOrderScreen
        onSubmit={() => go('waiting')}
        onBack={() => go('user-home')}
      />
    );
  }

  if (screen === 'waiting') {
    return (
      <WaitingScreen
        onDone={() => go('chat')}
        onBackHome={() => go('user-home')}
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
        isAgent={role === 'agent'}
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
