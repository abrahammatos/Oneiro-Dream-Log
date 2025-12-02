/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dream: {
          dark: "#0A0F24", // Deep Blue Background
          purple: "#3C2A4D", // Dark Purple
          blue: "#5D9EFF", // Neon Blue
          lilac: "#C8B1FF", // Soft Lilac
          light: "#F6F8FF", // Off-white
          surface: "#161B33", // Card background
        },
      },
    },
  },
  plugins: [],
};
