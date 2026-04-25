export { Fonts, FontSize } from './fonts';

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20,
  xl: 24, xxl: 32, xxxl: 40,
};

export const Radius = {
  sm: 5, md: 10, lg: 15, xl: 20, xxl: 50, full: 9999,
};

export const Shadow = {
  card: {
    shadowColor: '#BAB0F9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    shadowColor: '#A084E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 6,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
};

export type ThemeColors = typeof lightColors;

export const lightColors = {
  primary: '#673195',
  primaryLight: '#C9AEEC',
  primaryLighter: '#F3EFFF',
  primaryMid: '#934AD2',
  primaryAccent: '#AD7EE1',

  success: '#13C87A',
  successBg: '#A5E1AD',
  info: '#0070C0',
  infoBg: 'rgba(0,112,192,0.2)',
  error: '#DB0D0D',
  warning: '#FF9500',
  teal: '#268F85',
  tealDark: '#0D7C66',

  black: '#000000',
  white: '#FFFFFF',
  dark: '#1C1C1C',
  gray100: '#F4F4F4',
  gray200: '#E1E1E3',
  gray300: '#D1D1D6',
  gray400: '#C4C4C4',
  gray500: '#BAB9BD',
  gray600: '#83848B',
  textSecondary: 'rgba(60,60,67,0.6)',
  textTertiary: 'rgba(60,60,67,0.3)',

  bgCard: '#FFFFFF',
  bgPage: '#FFFFFF',
  bgOverlay: 'rgba(0,0,0,0.25)',

  shadowPurple: 'rgba(160,132,232,0.07)',
  shadowPurpleMid: 'rgba(186,176,249,0.4)',
  shadowDark: 'rgba(0,0,0,0.25)',
};

export const darkColors: ThemeColors = {
  primary: '#9B5FD8',
  primaryLight: '#6B3A9A',
  primaryLighter: '#1E1030',
  primaryMid: '#B070E8',
  primaryAccent: '#C090EE',

  success: '#1AE08A',
  successBg: '#0A2E1A',
  info: '#3090D8',
  infoBg: 'rgba(48,144,216,0.15)',
  error: '#FF5555',
  warning: '#FFB020',
  teal: '#30AFA5',
  tealDark: '#1D9C82',

  black: '#EEEEf4',          // primary text
  white: '#0D0D14',          // main background
  dark: '#D0D0DC',
  gray100: '#16161F',        // input / card bg
  gray200: '#232332',        // borders
  gray300: '#30303F',
  gray400: '#44444F',
  gray500: '#68687A',
  gray600: '#909098',
  textSecondary: 'rgba(210,210,225,0.55)',
  textTertiary: 'rgba(210,210,225,0.3)',

  bgCard: '#16161F',
  bgPage: '#0D0D14',
  bgOverlay: 'rgba(0,0,0,0.55)',

  shadowPurple: 'rgba(155,95,216,0.18)',
  shadowPurpleMid: 'rgba(155,95,216,0.28)',
  shadowDark: 'rgba(0,0,0,0.55)',
};

// Legacy export so any file using `Colors.X` directly still compiles
export const Colors = lightColors;
