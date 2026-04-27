/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rojo:      '#C0001A',
        negro:     '#0A0A0A',
        blanco:    '#F5F0EB',
        gris:      '#1A1A1A',
        'gris-mid':'#3A3A3A',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        titulo:  ['Anton', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
        ui:      ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

