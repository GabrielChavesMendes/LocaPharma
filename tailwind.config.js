/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0052CC', // Azul Médico
        secondary: '#00A7CB', // Teal (mantido para aspecto tecnológico)
        neutral: '#F8F9FA',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}