// client/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',            // your root HTML
    './src/**/*.{js,jsx,ts,tsx}',  // all JS/TS(X) under src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
