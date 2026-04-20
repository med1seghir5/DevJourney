import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'lego-red': '#E3000B',
        'lego-blue': '#006DB7',
        'lego-yellow': '#FFD700',
        'lego-green': '#00A650',
        'lego-orange': '#FF6E00',
        'lego-dark': '#1C2B39',
        'lego-border': 'rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', 'system-ui'],
        retro: ['var(--font-retro)', 'monospace'],
      },
      borderRadius: {
        brick: '4px',
      },
      boxShadow: {
        brick: '6px 6px 0px rgba(0,0,0,0.5)',
        'brick-pressed': '2px 2px 0px rgba(0,0,0,0.5)',
        'brick-hover': '8px 8px 0px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
export default config;
