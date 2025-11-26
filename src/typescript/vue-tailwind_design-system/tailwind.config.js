/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './.storybook/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e42',
        info: '#0ea5e9',
      },
      borderRadius: {
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
