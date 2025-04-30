// client/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:   '#162433', // darkest background
          deep:   '#2D3B4B',
          mid:    '#5A6775',
          light:  '#8A95A0',
          xlight: '#8DABCA',
          accent: '#83BBF5', // buttons & highlights
        },
      },
    },
  },
  plugins: [],
};
