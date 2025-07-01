/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        charlie: ['"Charlie Text"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
