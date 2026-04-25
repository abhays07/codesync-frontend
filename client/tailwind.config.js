/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'codesync-dark': '#070F2B',
        'codesync-deep': '#1B1A55',
        'codesync-border': '#535C91',
        'codesync-accent': '#9290C3',
      },
    },
  },
  plugins: [],
}