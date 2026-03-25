/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 1. Fundaluri & Layout
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)', // Folosești: bg-surface
          active: 'var(--color-surface-active)', // Folosești: bg-surface-active
        },

        // 2. Chat Bubbles
        bubble: {
          sent: {
            DEFAULT: 'var(--color-bubble-sent)', // bg-bubble-sent
            text: 'var(--color-bubble-sent-text)', // text-bubble-sent-text
            muted: 'var(--color-bubble-sent-muted)', // text-bubble-sent-muted
          },
          received: {
            DEFAULT: 'var(--color-bubble-received)',
            text: 'var(--color-bubble-received-text)',
            muted: 'var(--color-bubble-received-muted)',
          },
        },

        // 3. Avatare & Elemente UI
        avatar: {
          bg: 'var(--color-avatar-bg)', // bg-avatar-bg
          text: 'var(--color-avatar-text)', // text-avatar-text
        },
        input: {
          bg: 'var(--color-input-bg)', // bg-input-bg
          border: 'var(--color-border-input)', // border-input-border
        },
        border: 'var(--color-border)', // border-border

        // 4. Typography (Texte)
        text: {
          main: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)', // text-text-muted
          tiny: 'var(--color-text-tiny)', // text-text-tiny
          inverted: 'var(--color-text-inverted)', // text-text-inverted
        },

        primary: {
          DEFAULT: 'var(--color-primary)', // bg-primary / text-primary
          muted: 'var(--color-primary-muted)',
        },
        status: {
          unread: 'var(--color-unread-badge)', // bg-status-unread
          online: 'var(--color-online-dot)', // bg-status-online
        },
        alert: 'var(--color-alert)', // text-alert / bg-alert
        success: 'var(--color-success)', // text-success / bg-success
        btn: {
          primary: {
            DEFAULT: 'var(--color-btn-primary)',
            active: 'var(--color-btn-primary-active)',
            text: '#FFFFFF', // Textul rămâne alb și pe Light și pe Dark
          },
          success: {
            DEFAULT: 'var(--color-btn-success)',
            active: 'var(--color-btn-success-active)',
            text: '#FFFFFF',
          },
          danger: {
            DEFAULT: 'var(--color-btn-danger)',
            active: 'var(--color-btn-danger-active)',
            text: '#FFFFFF',
          },
          secondary: {
            DEFAULT: 'var(--color-btn-secondary)',
            active: 'var(--color-btn-secondary-active)',
            text: 'var(--color-btn-secondary-text)',
          },
          disabled: {
            DEFAULT: 'var(--color-btn-disabled)',
            text: 'var(--color-btn-disabled-text)',
          },
        },
      },
    },
  },
  plugins: [],
};
