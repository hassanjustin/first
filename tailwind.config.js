const { slateDark } = require('@radix-ui/colors');
import { colors } from './theme/colors';
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  darkMode: 'class',
  content: [
    './enterprise/app/views/**/*.html.erb',
    './app/javascript/widget/**/*.vue',
    './app/javascript/v3/**/*.vue',
    './app/javascript/dashboard/**/*.vue',
    './app/javascript/portal/**/*.vue',
    './app/javascript/shared/**/*.vue',
    './app/javascript/survey/**/*.vue',
    './app/views/**/*.html.erb',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
    fontSize: {
      ...defaultTheme.fontSize,
      xxs: '0.625rem',
    },
    colors: {
      transparent: 'transparent',
      white: '#fff',
      'modal-backdrop-light': 'rgba(0, 0, 0, 0.4)',
      'modal-backdrop-dark': 'rgba(0, 0, 0, 0.6)',
      current: 'currentColor',
      ...colors,
      body: slateDark.slate7,
    },
    keyframes: {
      ...defaultTheme.keyframes,
      wiggle: {
        '0%': { transform: 'translateX(0)' },
        '15%': { transform: 'translateX(0.375rem)' },
        '30%': { transform: 'translateX(-0.375rem)' },
        '45%': { transform: 'translateX(0.375rem)' },
        '60%': { transform: 'translateX(-0.375rem)' },
        '75%': { transform: 'translateX(0.375rem)' },
        '90%': { transform: 'translateX(-0.375rem)' },
        '100%': { transform: 'translateX(0)' },
      },
      'loader-pulse': {
        '0%': { opacity: 0.4 },
        '50%': { opacity: 1 },
        '100%': { opacity: 0.4 },
      },
      'card-select': {
        '0%, 100%': {
          transform: 'translateX(0)',
        },
        '50%': {
          transform: 'translateX(1px)',
        },
      },
    },
    animation: {
      ...defaultTheme.animation,
      wiggle: 'wiggle 0.5s ease-in-out',
      'loader-pulse': 'loader-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'card-select': 'card-select 0.25s ease-in-out',
    },
    backgroundImage: {
      ...defaultTheme.backgroundImage,
      'signup-gradient': `linear-gradient(90deg, rgba(252, 252, 253, 0) 81.8%, #fcfcfd 95%),
                               linear-gradient(270deg, rgba(252, 252, 253, 0) 76.93%, #fcfcfd 95%),
                               linear-gradient(0deg, rgba(252, 252, 253, 0) 68.63%, #fcfcfd 95%),
                               linear-gradient(180deg, rgba(252, 252, 253, 0) 73.2%, #fcfcfd 95%)`,
      'signup-gradient-dark': `linear-gradient(270deg, rgba(24, 24, 26, 0) 76.93%, #151718 95%),
                          linear-gradient(90deg, rgba(24, 24, 26, 0) 81.8%, #151718 95%),
                          linear-gradient(0deg, rgba(24, 24, 26, 0) 68.63%, #151718 95%),
                          linear-gradient(180deg, rgba(24, 24, 26, 0) 73.2%, #151718 95%)`,
      'onboarding-gradient': `linear-gradient(90deg, rgba(252, 252, 253, 0) 61.8%, #fcfcfd 90%),
                                   linear-gradient(270deg, rgba(252, 252, 253, 0) 66.93%, #fcfcfd 90%),
                                   linear-gradient(0deg, rgba(252, 252, 253, 0) 68.63%, #fcfcfd 90%),
                                   linear-gradient(180deg, rgba(252, 252, 253, 0) 63.2%, #fcfcfd 80%)`,
      'onboarding-gradient-dark': `linear-gradient(270deg, rgba(24, 24, 26, 0) 61.93%, #151718 90%),
                              linear-gradient(90deg, rgba(24, 24, 26, 0) 66.8%, #151718 90%),
                              linear-gradient(0deg, rgba(24, 24, 26, 0) 68.63%, #151718 90%),
                              linear-gradient(180deg, rgba(24, 24, 26, 0) 63.2%, #151718 90%)`,
    },
    dropShadow: {
      ...defaultTheme.dropShadow,
      'signup-border': [
        '1px 1px 0 var(--s-50)',
        '-1px -1px 0 var(--s-50)',
        '1px -1px 0 var(--s-50)',
        '-1px 1px 0 var(--s-50)',
      ],
      'signup-border-dark': [
        '1px 1px 0 var(--s-900)',
        '-1px -1px 0 var(--s-900)',
        '1px -1px 0 var(--s-900)',
        '-1px 1px 0 var(--s-900)',
      ],
    },
  },
  plugins: [
    // eslint-disable-next-line
    require('@tailwindcss/typography'),
  ],
};
