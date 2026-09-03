/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0B0B',
          card: '#141414',
          elevated: '#1C1C1C',
          border: '#252525',
          accent: '#00D09C',
          success: '#00D09C',
          warning: '#F59E0B',
          danger: '#EF4444',
          muted: '#A1A1AA',
        },
      },
    },
  },
  plugins: [],
}
