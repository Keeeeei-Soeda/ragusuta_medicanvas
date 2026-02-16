import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f7',
          100: '#ccede4',
          200: '#99dbca',
          300: '#66c9af',
          400: '#33b795',
          500: '#00a57a',
          600: '#008462',
          700: '#006349',
          800: '#004231',
          900: '#002118',
        },
      },
    },
  },
  plugins: [],
}
export default config






