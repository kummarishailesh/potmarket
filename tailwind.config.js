/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shadow-pulse': 'shadow-pulse 2s infinite',
        'add-to-cart': 'add-to-cart 0.6s ease-in-out',
        'wishlist-pop': 'wishlist-pop 0.6s ease-in-out',
        'bubble': 'bubble 25s linear infinite',
      }
    },
  },
  plugins: [],
}