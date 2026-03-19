/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'up-dark': '#0f172a',
        'up-navy': '#1e293b',
        'up-slate': '#334155',
        'up-red': '#dc2626',
        'up-gold': '#f59e0b',
        'up-green': '#16a34a',
        'up-blue': '#2563eb',
        'up-cash': '#16a34a',
        'up-finance': '#2563eb',
        'up-lease': '#7c3aed',
      }
    }
  },
  plugins: []
}
