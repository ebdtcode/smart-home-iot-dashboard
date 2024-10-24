/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './src/**/*.ts'
  ],
  safelist: [
    'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-red-50',
    'text-blue-800', 'text-green-800', 'text-yellow-800', 'text-red-800'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};