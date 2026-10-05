/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma Design System Core Tokens (Canvas 01)
        primary: {
          DEFAULT: '#5B4DF5',
          hover: '#4B3CE0',
          active: '#3D2EC8',
          light: '#EEECFF',
        },
        secondary: {
          DEFAULT: '#EEECFF',
          dark: '#5B4DF5',
        },
        accent: {
          DEFAULT: '#16B8D4',
        },
        success: {
          DEFAULT: '#19A974',
          bg: '#E8F8F1',
        },
        warning: {
          DEFAULT: '#D68A16',
          bg: '#FFF5DF',
        },
        danger: {
          DEFAULT: '#E04F5F',
          bg: '#FFF0F1',
        },

        // Figma Neutral / Surfaces
        background: '#F5F7FB',
        surface: '#FFFFFF',
        'dark-text': '#171A2E',
        'muted-text': '#5C6175',
        'meta-text': '#9499AB',
        'tf-border': '#E6E9F2',

        // Academic Workflow Status Tokens (5 Stages & Urgencies)
        workflow: {
          'not-started': '#9499AB',
          'in-progress': '#5B4DF5',
          completed: '#16B8D4',
          erp: '#7970D9',
          verified: '#19A974',
          overdue: '#E04F5F',
          'due-today': '#E04F5F',
          'due-soon': '#D68A16',
        },

        // Figma 'tf' Design System Token Set
        tf: {
          primary: '#5B4DF5',
          'primary-hover': '#4B3CE0',
          'primary-active': '#3D2EC8',
          secondary: '#EEECFF',
          accent: '#16B8D4',
          bg: '#F5F7FB',
          surface: '#FFFFFF',
          elevated: '#FFFFFF',
          border: '#E6E9F2',
          'text-primary': '#171A2E',
          'text-secondary': '#5C6175',
          'text-muted': '#9499AB',
          success: '#19A974',
          'success-bg': '#E8F8F1',
          warning: '#D68A16',
          'warning-bg': '#FFF5DF',
          danger: '#E04F5F',
          'danger-bg': '#FFF0F1',
          info: '#5B4DF5',
          'info-bg': '#EEECFF',

          // Dark Mode Tokens (Canvas 01 / Canvas 03)
          'dark-bg': '#0B1020',
          'dark-surface': '#11142B',
          'dark-surface-elevated': '#15172F',
          'dark-border': '#1E293B',
          'dark-text': '#F1F5F9',
          'dark-muted': '#94A3B8',

          // Semantic aliases
          indigo: '#5B4DF5',
          lavender: '#EEECFF',
          deep: '#171A2E',
          navy: '#11142B',
          muted: '#5C6175',
          subtle: '#9499AB',
          blue: '#5B4DF5',
          cyan: '#16B8D4',
        },

        // Backward compatibility
        brand: {
          50: '#EEECFF',
          100: '#E0DEFE',
          200: '#C7C2FD',
          300: '#A49DFC',
          400: '#7E74FA',
          500: '#5B4DF5',
          600: '#4B3CE0',
          700: '#3D2EC8',
          800: '#3124A6',
          900: '#271D86',
          950: '#11142B',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Manrope"', 'sans-serif'],
        heading: ['"Manrope"', 'sans-serif'],
        headline: ['"Manrope"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
        btn: '10px',
        input: '10px',
        card: '14px',
        pill: '999px',
        full: '9999px',
        '10px': '10px',
        '14px': '14px',
        '16px': '16px',
      },
      backgroundImage: {
        'brand-linear': 'linear-gradient(135deg, rgba(110, 93, 251, 1) 0%, rgba(67, 56, 202, 1) 100%)',
        'brand-accent': 'linear-gradient(90deg, #5B4DF5 0%, #7970D9 65%, #16B8D4 100%)',
        'brand-rail': 'linear-gradient(180deg, #5B4DF5 0%, #7970D9 50%, #16B8D4 100%)',
        'brand-radial': 'radial-gradient(circle at 50% 50%, rgba(91, 77, 245, 0.08) 0%, rgba(91, 77, 245, 0) 100%)',
      },
      boxShadow: {
        'tf-subtle': '0px 1px 3px 0px rgba(17, 26, 56, 0.04)',
        'tf-card': '0px 4px 12px 0px rgba(17, 26, 56, 0.06)',
        'tf-modal': '0px 12px 32px 0px rgba(17, 26, 56, 0.12)',
        'tf-hero': '0px 24px 64px 0px rgba(17, 26, 56, 0.14)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '380': '380ms',
        '400': '400ms',
        '420': '420ms',
        '450': '450ms',
        '500': '500ms',
        '550': '550ms',
        '680': '680ms',
      },
      transitionTimingFunction: {
        'figma-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'figma-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'figma-spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'page-entry': 'pageEntry 380ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'card-entry': 'cardEntry 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-entry': 'toastEntry 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'btn-press': 'btnPress 200ms ease-out',
        'stage-pulse': 'stagePulse 200ms ease-out',
        'calendar-expand': 'calendarExpand 420ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards',
      },
      keyframes: {
        pageEntry: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        cardEntry: {
          '0%': { transform: 'translateY(12px) scale(0.985)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        toastEntry: {
          '0%': { transform: 'translateY(18px) scale(0.96)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        btnPress: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(1px)' },
          '100%': { transform: 'translateY(0)' },
        },
        stagePulse: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
          '100%': { transform: 'translateY(0)' },
        },
        calendarExpand: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
