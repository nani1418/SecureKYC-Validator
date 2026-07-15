/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        banking: {
          navy: {
            DEFAULT: '#0B192C',
            light: '#1A304D',
            dark: '#050B14'
          },
          blue: {
            DEFAULT: '#1E3E62',
            light: '#2E5A8E',
            dark: '#11253C'
          },
          teal: {
            DEFAULT: '#008DDA',
            light: '#41C9E2',
            dark: '#006699'
          },
          cyan: '#E0F4FF',
          accent: '#00F0FF',
          silver: '#F5F7F8',
          success: '#10B981',
          danger: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 40h40V0H0v40zM1 39V1h38v38H1z' fill='%231e293b' fill-opacity='.05'/%3E%3C/svg%3E\")",
        'grid-pattern-dark': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 40h40V0H0v40zM1 39V1h38v38H1z' fill='%23ffffff' fill-opacity='.02'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
