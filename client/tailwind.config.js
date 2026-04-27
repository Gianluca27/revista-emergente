/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rojo:        '#A8161B',
        'rojo-osc':  '#7A0F14',
        negro:       '#1A1A1A',
        crema:       '#F5EFE6',
        blanco:      '#F5EFE6',
        papel:       '#E8E0D5',
        gris:        '#E8E0D5',
        'gris-mid':  '#6B6B6B',
        'gris-suave':'#C9BFB1',
      },
      fontFamily: {
        display: ['"Permanent Marker"', '"Bebas Neue"', 'cursive'],
        titulo:  ['"Anton"', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
        ui:      ['"Barlow Condensed"', 'sans-serif'],
        grunge:  ['"Rubik Wet Paint"', '"Bebas Neue"', 'sans-serif'],
        marker:  ['"Permanent Marker"', 'cursive'],
      },
    },
  },
  plugins: [],
}

