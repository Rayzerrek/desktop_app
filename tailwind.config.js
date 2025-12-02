module.exports = {
  darkMode: 'class',
  content: [
  "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        // Modern neutral palette
        background: {
          DEFAULT: '#FAFAFA',
          dark: '#0A0A0A',
        },
        foreground: {
          DEFAULT: '#171717',
          dark: '#EDEDED',
        },
        border: {
          DEFAULT: '#E5E5E5',
          dark: '#262626',
        },
        // Accent colors - inspired by Vercel
        accent: {
          DEFAULT: '#0070F3',
          hover: '#0761D1',
          dark: '#3291FF',
        },
        success: {
          DEFAULT: '#0070F3',
          hover: '#0761D1',
          light: '#E6F5FF',
          dark: '#1A1A1A',
        },
        error: {
          DEFAULT: '#E00',
          hover: '#C00',
          light: '#FFEBEB',
          dark: '#1A1A1A',
        },
        muted: {
          DEFAULT: '#666666',
          dark: '#A1A1A1',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#141414',
          hover: '#F5F5F5',
          'hover-dark': '#1A1A1A',
        }
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
        bold: '800',
      }
    }
  },
  plugins: [],
}

