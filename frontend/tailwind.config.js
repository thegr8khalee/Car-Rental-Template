import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        microgramma: ['Microgramma D Extended', 'sans-serif'],
        inter: ['Instrument Sans', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
