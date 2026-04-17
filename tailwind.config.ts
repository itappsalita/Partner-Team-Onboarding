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
        alita: {
          orange: "#ff7a00",
          "orange-light": "#ff9a33",
          "orange-dark": "#e06500",
          "orange-glow": "rgba(255, 122, 0, 0.15)",
          "orange-subtle": "rgba(255, 122, 0, 0.08)",
          black: "#0f0f0f",
          "black-soft": "#1a1a1e",
          "black-card": "#222228",
          "black-secondary": "#333340",
          charcoal: "#2a2a30",
          white: "#ffffff",
          "off-white": "#fafafa",
          gray: {
            50: "#f7f7f8",
            100: "#ebebef",
            200: "#d4d4db",
            300: "#b0b0bb",
            400: "#8a8a99",
            500: "#6e6e80",
            600: "#4e4e5c",
          },
        },
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        orange: "0 4px 20px rgba(255, 122, 0, 0.25)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,122,0,0.1)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        elevated: "0 10px 40px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        "inner-soft": "inset 0 2px 4px rgba(0,0,0,0.04)",
      },
      transitionTimingFunction: {
        "ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in-scale": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "pulse-soft": "pulse-soft 2s infinite ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in-scale": "fade-in-scale 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
