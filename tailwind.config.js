/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        card: token("card"),
        sunk: token("sunk"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        xred: token("x"),
        oteal: token("o"),
        mustard: token("accent"),
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        lift: "0 1px 0 rgb(var(--ink) / 0.04), 0 12px 32px -12px rgb(var(--ink) / 0.18)",
        tile: "inset 0 -3px 0 rgb(var(--ink) / 0.07)",
        press: "3px 3px 0 rgb(var(--ink))",
      },
    },
  },
  plugins: [],
};
