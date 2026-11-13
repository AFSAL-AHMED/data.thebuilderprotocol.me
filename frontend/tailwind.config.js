/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#B8860B',
          light: '#D4A017',
          bg: '#FDF8EE',
        },
        charcoal: '#1A1A1A',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        body: '#FAFAF8',
      },
    },
  },
  plugins: [],
}
