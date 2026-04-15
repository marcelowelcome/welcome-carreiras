import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores por marca
        weddings: {
          DEFAULT: "#C4A882",
          light: "#F5EDE4",
          dark: "#8B6E4E",
        },
        trips: {
          DEFAULT: "#0091B3",
          light: "#E6F5F9",
          dark: "#007A99",
        },
        welconnect: {
          DEFAULT: "#5B9A6B",
          light: "#E8F5EC",
          dark: "#3A6B47",
        },
        corporativo: {
          DEFAULT: "#1A1A2E",
          light: "#F2F2F5",
          dark: "#0D0D1A",
        },
        // Cores do sistema (portal multi-marca / admin)
        primary: "#1A1A2E",
        accent: "#D4A574",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        muted: "#6B7280",
        surface: "#FFFFFF",
        background: "#FAFAF9",
        border: "#E5E7EB",
        // Welcome Trips — design system completo (DESIGN_SYSTEM_WELCOME_TRIPS.md)
        wt: {
          primary: "#0091B3",
          "primary-dark": "#007A99",
          "primary-light": "#E6F5F9",
          "teal-deep": "#0D5257",
          "teal-mid": "#00968F",
          yellow: "#F6BE00",
          orange: "#EA7600",
          red: "#D14124",
          "off-white": "#F8F7F4",
          "gray-100": "#F2F0ED",
          "gray-300": "#D1CCC5",
          "gray-500": "#8A8580",
          "gray-700": "#4A4540",
          black: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        "wt-heading": ["var(--font-nunito-sans)", "Avenir Next", "system-ui", "sans-serif"],
        "wt-body": ["var(--font-nunito-sans)", "Avenir Next", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "wt-sm": "6px",
        "wt-md": "12px",
        "wt-lg": "16px",
        "wt-xl": "24px",
      },
      boxShadow: {
        "wt-sm": "0 1px 3px rgba(0, 0, 0, 0.06)",
        "wt-md": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "wt-lg": "0 8px 24px rgba(0, 0, 0, 0.1)",
      },
      maxWidth: {
        "wt-container": "1280px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
