/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: true, // This ensures Tailwind classes override Mantine styles when needed
  theme: {
    darkMode: 'class',
    extend: {
      backgroundImage: {
        'wallet-bg': "url('/src/assets/bg.jpg')",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to prevent conflicts with Mantine
  },
} 