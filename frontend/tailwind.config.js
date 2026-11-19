/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          subtle: 'var(--surface-subtle)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
        },
        line: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          muted: 'var(--ink-muted)',
          inverse: 'var(--ink-inverse)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          subtle: 'var(--primary-subtle)',
          border: 'var(--primary-border)',
          ink: 'var(--primary-ink)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          solid: 'var(--accent-solid)',
          subtle: 'var(--accent-subtle)',
          border: 'var(--accent-border)',
        },
        status: {
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          'success-border': 'var(--status-success-border)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          'warning-border': 'var(--status-warning-border)',
          error: 'var(--status-error)',
          'error-bg': 'var(--status-error-bg)',
          'error-border': 'var(--status-error-border)',
        },
        chrome: {
          bar: 'var(--chrome-bar)',
          border: 'var(--chrome-bar-border)',
          ink: 'var(--chrome-ink)',
          muted: 'var(--chrome-ink-muted)',
        },
        canvas: {
          backdrop: 'var(--canvas-backdrop)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '180ms',
      },
    },
  },
  plugins: [],
};
