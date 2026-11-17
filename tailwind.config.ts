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
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        muted: "var(--text-muted)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-contrast": "var(--primary-contrast)",
        like: "var(--like)",
        pass: "var(--pass)",
        accent: "var(--accent)",
        "match-bg": "var(--match-bg)",
        "match-text": "var(--match-text)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(31, 26, 28, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
