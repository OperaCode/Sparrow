import { Platform } from 'react-native';

export const colors = {
  primary: '#FFB703',
  primaryDark: '#D97706',
  primaryLight: '#FFD166',
  primarySoft: '#FFF4CC',
  ink: '#152436',
  inkSoft: '#24415C',
  skySoft: '#E4F6FE',

  background: '#F7F8F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F3',

  text: '#152436',
  textSecondary: '#5C6C7D',
  textTertiary: '#8D9AA8',

  border: '#E8E8E5',
  borderLight: '#F0F0EE',

  success: '#159A68',
  successLight: '#DCFCE7',
  info: '#168BC2',
  infoLight: '#E4F6FE',
  warning: '#EA580C',
  warningLight: '#FFEDD5',
  error: '#DC2626',
  errorLight: '#FEE2E2',

  // Playful accent palette — used to color-code categories, badges, and
  // decorative touches so the app doesn't read as flat/monochrome.
  coral: '#F26B4F',
  coralLight: '#FFE4E0',
  purple: '#8B5CF6',
  purpleLight: '#EDE4FF',
  teal: '#0D9488',
  tealLight: '#D9F5F1',
  sky: '#13A8E8',
  skyLight: '#E0F4FF',
  pink: '#EC4899',
  pinkLight: '#FCE2F0',

  white: '#FFFFFF',
  black: '#000000',

  shadow: '#000000',
} as const;

export const gradients = {
  primary: ['#FFC933', '#FF9F1C'] as const,
  dark: ['#2A2A2A', '#111111'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  xxl: 34,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 40,
  },
  h1: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    lineHeight: 30,
  },
  h3: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  captionMedium: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
} as const;

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    android: { elevation: 1 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    android: { elevation: 3 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 6 },
    default: {},
  }),
} as const;
