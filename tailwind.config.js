/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        flow: {
          bg: '#090A0C',
          sidebar: '#0D0F12',
          surface: {
            primary: '#12151A',
            elevated: '#181C22',
            hover: '#20252D',
          },
          text: {
            primary: '#F4F5F7',
            secondary: '#A1A8B3',
            muted: '#717987',
          },
          border: '#282D35',
          accent: {
            DEFAULT: '#8AB4F8',
            hover: '#A6C6FA',
            subtle: '#172337',
          },
          status: {
            success: '#34D399',
            'success-subtle': '#064E3B',
            warning: '#FBBF24',
            'warning-subtle': '#451A03',
            error: '#F87171',
            'error-subtle': '#450A0A',
            neutral: '#9CA3AF',
            'neutral-subtle': '#1F2937',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
