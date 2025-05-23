import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0B5ED7", // light blue
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#A2CDB0", // mint green
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        darkBlue: "#071952", // dark blue
        lightBlue: "#0B5ED7", // light blue
        offWhite: "#F6F1F1", // off-white
        mintGreen: "#A2CDB0", // mint green
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #0B5ED7, 0 0 10px #0B5ED7" },
          "50%": { boxShadow: "0 0 20px #0B5ED7, 0 0 30px #0B5ED7" },
        },
        "timeline-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(11, 94, 215, 0.7)",
            transform: "scale(1)"
          },
          "50%": {
            boxShadow: "0 0 0 10px rgba(11, 94, 215, 0)",
            transform: "scale(1.05)"
          },
        },
        "timeline-glow": {
          "0%": { boxShadow: "0 0 5px rgba(11, 94, 215, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(11, 94, 215, 0.8)" },
          "100%": { boxShadow: "0 0 5px rgba(11, 94, 215, 0.5)" },
        },
        "timeline-progress": {
          "0%": { width: "0%", opacity: 0.7 },
          "100%": { width: "100%", opacity: 1 },
        },
        "timeline-appear": {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "timeline-pulse": "timeline-pulse 3s ease-in-out infinite",
        "timeline-glow": "timeline-glow 2s ease-in-out infinite",
        "timeline-progress": "timeline-progress 2s ease-out forwards",
        "timeline-appear": "timeline-appear 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
