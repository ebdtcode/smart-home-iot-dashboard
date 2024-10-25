/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js,ts}",
    "./src/**/*.{html,js,ts}",
    "./dist/public/**/*.{html,js}"
  ],
  safelist: [
    'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-red-50',
    'text-blue-800', 'text-green-800', 'text-yellow-800', 'text-red-800',
    'bg-yellow-100', 'bg-yellow-300',
    'bg-green-500', 'bg-gray-400',
    'bg-orange-100', 'bg-red-200',
    'led-on', 'led-off'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
