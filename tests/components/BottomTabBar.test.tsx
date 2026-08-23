import React, { useEffect } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { darkColors } from '../../src/constants/colors';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Ionicons: (props: Record<string, unknown>) => <Text {...props} />,
  };
});

const renderTabBar = ({ isAgent = false, activeRoute = 'home' } = {}) => {
  const onTabPress = jest.fn();

  return {
    onTabPress,
    ...render(
      <ThemeProvider>
        <LanguageProvider initialLang="en">
          <BottomTabBar activeRoute={activeRoute} onTabPress={onTabPress} isAgent={isAgent} />
        </LanguageProvider>
      </ThemeProvider>,
    ),
  };
};

const DarkTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    if (!isDark) toggle();
  }, [isDark, toggle]);

  return <>{isDark ? children : null}</>;
};

describe('BottomTabBar', () => {
  it('renders four labelled courier tab actions without new-order or a centre spacer', () => {
    const { getAllByRole, getByLabelText, queryByLabelText, queryByTestId } = render(
      <ThemeProvider>
        <LanguageProvider initialLang="en">
          <BottomTabBar activeRoute="home" onTabPress={jest.fn()} isAgent />
        </LanguageProvider>
      </ThemeProvider>,
    );

    expect(getAllByRole('button')).toHaveLength(4);
    expect(getByLabelText('Home')).toBeTruthy();
    expect(getByLabelText('Orders')).toBeTruthy();
    expect(getByLabelText('Chats')).toBeTruthy();
    expect(getByLabelText('Profile')).toBeTruthy();
    expect(queryByLabelText('New order')).toBeNull();
    expect(queryByTestId('new-order-spacer')).toBeNull();
    expect(queryByTestId('tab-icon-home')).toBeTruthy();
    expect(queryByTestId('tab-icon-orders')).toBeTruthy();
    expect(queryByTestId('tab-icon-chat')).toBeTruthy();
    expect(queryByTestId('tab-icon-profile')).toBeTruthy();
    expect(queryByTestId('tab-icon-home')).toHaveProp('name', 'home');
    expect(queryByTestId('tab-icon-orders')).toHaveProp('name', 'receipt-outline');
    expect(queryByTestId('tab-icon-chat')).toHaveProp('name', 'chatbubble-outline');
    expect(queryByTestId('tab-icon-profile')).toHaveProp('name', 'person-outline');
  });

  it('uses dark-theme active and inactive icon colors and invokes the selected route', () => {
    const onTabPress = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <ThemeProvider>
        <DarkTheme>
          <LanguageProvider initialLang="en">
            <BottomTabBar activeRoute="orders" onTabPress={onTabPress} isAgent />
          </LanguageProvider>
        </DarkTheme>
      </ThemeProvider>,
    );

    expect(getByTestId('tab-icon-orders')).toHaveProp('color', darkColors.primary);
    expect(getByTestId('tab-icon-home')).toHaveProp('color', darkColors.gray500);
    fireEvent.press(getByLabelText('Chats'));
    expect(onTabPress).toHaveBeenCalledWith('chat');
  });

  it('renders the customer new-order action', () => {
    const { getByLabelText } = renderTabBar();

    expect(getByLabelText('New Order')).toBeTruthy();
  });
});
