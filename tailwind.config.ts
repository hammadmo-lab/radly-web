import type { Config } from 'tailwindcss'

const config: Config = {
  // Use a string (correct Tailwind typing), not ['class']
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
}

export default config