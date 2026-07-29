/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sortech: {
          50: "#eef5ff",
          100: "#d9e9ff",
          200: "#b7d4ff",
          300: "#84b6ff",
          400: "#4b8fff",
          500: "#2166f0", // primary brand blue
          600: "#154fce",
          700: "#123fa6",
          800: "#133686",
          900: "#14306e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
