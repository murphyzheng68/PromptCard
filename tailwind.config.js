/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FAFAF9',
          card: '#FFFFFF',
          hover: '#F4F4F2',
        },
        ink: {
          DEFAULT: '#1C1C1A',
          muted: '#6B6B66',
          light: '#9C9C95',
        },
        accent: {
          DEFAULT: '#5B4FE9',
          hover: '#4A3FD0',
          light: '#EEEDFE',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
