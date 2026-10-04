/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          light: "var(--color-primary-light)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          900: "var(--color-primary-900)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          light: "var(--color-secondary-light)",
          50: "var(--color-secondary-50)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
        },
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          muted: "var(--color-surface-muted)",
          raised: "var(--color-surface-raised)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
        },
        foreground: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          subtle: "var(--color-text-subtle)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
      },
      fontFamily: {
        qomra: ["var(--font-qomra)", "qomra", "sans-serif"],
        arabic: ["var(--font-qomra)", "qomra", "Cairo", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(13, 74, 55, 0.05), 0 1px 2px -1px rgba(13, 74, 55, 0.03)',
        'card': '0 2px 8px 0 rgba(13, 74, 55, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(13, 74, 55, 0.12), 0 6px 12px -2px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 30px -5px rgba(13, 74, 55, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'gov': '0.5rem',
      },
    },
  },
  plugins: [],
};
