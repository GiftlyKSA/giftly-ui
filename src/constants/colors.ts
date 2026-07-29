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
  primaryButton: '#673195',
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

// Dark palette — tuned against WCAG 2.1 contrast ratios (see notes):
//  - No pure black background (#000000) or pure white text (#FFFFFF).
//  - Body/label text: >= 4.5:1 (AA, normal text). Large/bold headings: >= 3:1.
//  - `primary` (text/icons on dark surfaces) and `primaryButton` (solid
//    button fills carrying white text) are intentionally two different
//    shades — a single purple can't clear 4.5:1 in both directions at once.
export const darkColors: ThemeColors = {
  primary: '#A979E0',        // text/icons on dark surfaces — 5.65:1 on bgPage, 5.07:1 on bgCard
  primaryButton: '#7A30CF',  // solid button fill — white text on it is 6.66:1
  primaryLight: '#281839',   // avatar/icon-wrap tint — primary-colored text on it is 5.08:1
  primaryLighter: '#251C36', // card/badge tint — darkened so it no longer glares on black
  primaryMid: '#9B5FD8',
  primaryAccent: '#C090EE',

  success: '#3DDB93',
  successBg: '#0F3324',
  info: '#3090D8',
  infoBg: 'rgba(48,144,216,0.15)',
  error: '#FF6B6B',          // 6.58:1 on bgPage, 5.90:1 on bgCard
  warning: '#FFB020',
  teal: '#30AFA5',
  tealDark: '#1D9C82',

  black: '#ECECF1',          // primary text — 15.51:1 on bgPage (off-white, not pure #FFF)
  white: '#211E29',          // card / surface background — distinct step above bgPage
  dark: '#DCD6E4',
  gray100: '#1C1A22',        // soft fill (chat canvas, input fields) — a step below card surfaces
  gray200: '#332F3F',        // borders
  gray300: '#413C4D',
  gray400: '#5A5468',
  gray500: '#8A8496',        // 5.06:1 on bgPage, 4.54:1 on bgCard — safe for small icons/labels
  gray600: '#B0AABC',
  textSecondary: 'rgba(214,214,226,0.72)', // ~7.0:1 on bgPage, ~6.5:1 on bgCard
  textTertiary: 'rgba(214,214,226,0.55)',  // ~4.6:1 on bgPage — least-emphasis text, still AA

  bgCard: '#211E29',
  bgPage: '#16141B',         // warm dark gray, not pure black
  bgOverlay: 'rgba(0,0,0,0.55)',

  shadowPurple: 'rgba(155,95,216,0.18)',
  shadowPurpleMid: 'rgba(155,95,216,0.28)',
  shadowDark: 'rgba(0,0,0,0.55)',
};

// Legacy export so any file using `Colors.X` directly still compiles
export const Colors = lightColors;
