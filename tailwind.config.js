/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#212153',
        secondary: '#E2E2E2',
        success: '#45D375',
        danger: '#EFB3B3',
        neutral: '#E2E2E2',
      },
    },
  },
  plugins: [],
}
