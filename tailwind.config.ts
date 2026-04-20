import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          'green-dark': '#2D5A27',
          'green': '#4A7C3F',
          'green-light': '#6B9E5E',
          'green-pale': '#E8F0E4',
          'orange': '#E8913A',
          'orange-light': '#F5A855',
          'orange-pale': '#FFF3E0',
          'cream': '#FFF9F0',
          'cream-dark': '#F5EDE0',
          'brown': '#5C3D2E',
          'teal': '#2A9D8F',
          'teal-pale': '#E0F5F1',
        },
      },
      fontFamily: {
        heading: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
    },
  },
  plugins: [],
}

export default config
