const { light, dark } = require("@charcoal-ui/theme");
const { createTailwindConfig } = require("@charcoal-ui/tailwind-config");
/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  darkMode: true,
  content: ["./src/**/*.tsx", "./src/**/*.html"],
  presets: [
    createTailwindConfig({
      version: "v3",
      theme: {
        ":root": light,
      },
    }),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f7dc2",
        "primary-hover": "#83c4e2",
        "primary-press": "#0f7dc2",
        "primary-disabled": "#0d69a34d",
        secondary: "#0f7dc2",
        "secondary-hover": "#83c4e2",
        "secondary-press": "#0f7dc2",
        "secondary-disabled": "#0d69a34d",
        base: "#E0E0E0",
        "text-primary": "#000000",
      },
      fontFamily: {
        M_PLUS_2: ["var(--font-m-plus-2)"],
        Montserrat: ["var(--font-montserrat)"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
