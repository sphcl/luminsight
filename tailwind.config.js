// Toda cor vem de variável CSS (src/index.css), então a mesma classe serve nos dois temas.
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('bg'),
        surface: {
          DEFAULT: token('surface'),
          muted: token('surface-muted'),
        },
        ink: {
          DEFAULT: token('text'),
          soft: token('text-soft'),
          muted: token('text-muted'),
        },
        // rule é régua decorativa entre seções; control é contorno de campo e precisa de 3:1 (WCAG 1.4.11).
        rule: token('border'),
        strong: token('border-strong'),
        control: token('border-control'),
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          soft: token('accent-soft'),
          on: token('on-accent'),
        },
        success: { DEFAULT: token('success'), soft: token('success-soft') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '6px',
      },
      keyframes: {
        enter: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rule-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        enter: 'enter 220ms ease-out both',
        'rule-grow': 'rule-grow 600ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}
