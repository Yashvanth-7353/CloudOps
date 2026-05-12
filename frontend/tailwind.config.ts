import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // Primary palette - CloudOps branding
        background: {
          DEFAULT: '#0B1020',
          secondary: '#131A2A',
          tertiary: '#1A2238',
        },
        surface: {
          DEFAULT: '#131A2A',
          elevated: '#1A2238',
          glass: 'rgba(19, 26, 42, 0.6)',
        },
        primary: {
          50: '#F3F0FF',
          100: '#E8DFFE',
          200: '#D0BCFE',
          300: '#B8A4FD',
          400: '#A08BFC',
          500: '#8B73FB',
          600: '#7C5AFF', // Main primary
          DEFAULT: '#6C63FF',
          700: '#6C63FF', // CloudOps primary
          800: '#5D52D9',
          900: '#4A41B8',
          950: '#342980',
        },
        accent: {
          50: '#CCFFFE',
          100: '#99FFFF',
          200: '#66FFFF',
          300: '#33FFFF',
          400: '#1FE9E9',
          500: '#00D4FF', // Main accent
          DEFAULT: '#00D4FF',
          600: '#00B8CC',
          700: '#009099',
          800: '#006B7F',
          900: '#004D5C',
        },
        success: {
          50: '#ECFFFE',
          100: '#C7FFEC',
          200: '#9FFEE0',
          300: '#6FFED4',
          400: '#3CFCC8',
          500: '#00C896', // Success green
          DEFAULT: '#00C896',
          600: '#00A86E',
          700: '#007A4F',
          800: '#005A3A',
          900: '#003D28',
        },
        error: {
          50: '#FFF5F7',
          100: '#FFDDE3',
          200: '#FFBBC7',
          300: '#FF99AB',
          400: '#FF778F',
          500: '#FF5D73', // Error red
          DEFAULT: '#FF5D73',
          600: '#E63556',
          700: '#C91F3B',
          800: '#A01527',
          900: '#7D0E1B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          DEFAULT: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#B4BAC4',
          tertiary: '#7A8294',
          disabled: '#5A6370',
        },
        border: {
          light: 'rgba(255, 255, 255, 0.1)',
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          dark: 'rgba(255, 255, 255, 0.06)',
        },
      },
      backgroundColor: {
        glass: 'rgba(19, 26, 42, 0.6)',
        'glass-light': 'rgba(26, 34, 56, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
        'gradient-success': 'linear-gradient(135deg, #00C896 0%, #00D4FF 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glow': '0 0 20px rgba(108, 99, 255, 0.3)',
        'glow-accent': '0 0 20px rgba(0, 212, 255, 0.2)',
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 4px 8px 0 rgba(0, 0, 0, 0.4)',
        'elevation-3': '0 8px 16px 0 rgba(0, 0, 0, 0.5)',
        'elevation-4': '0 12px 24px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'slide-in-down': 'slideInDown 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(108, 99, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.6)' },
          '100%': { boxShadow: '0 0 10px rgba(108, 99, 255, 0.3)' },
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      opacity: {
        glass: '0.6',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};

export default config;
