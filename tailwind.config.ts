import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        xp: {
          DEFAULT: "hsl(var(--xp))",
          glow: "hsl(var(--xp-glow))",
        },
        rank: {
          bronze: "hsl(var(--rank-bronze))",
          silver: "hsl(var(--rank-silver))",
          gold: "hsl(var(--rank-gold))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
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
        "pulse-glow": {
          "0%, 100%": { 
            opacity: "1",
            filter: "drop-shadow(0 0 8px hsl(var(--xp) / 0.6))"
          },
          "50%": { 
            opacity: "0.8",
            filter: "drop-shadow(0 0 16px hsl(var(--xp) / 0.8))"
          },
        },
        "float-up": {
          "0%": { 
            opacity: "1",
            transform: "translateY(0) scale(1)"
          },
          "100%": { 
            opacity: "0",
            transform: "translateY(-60px) scale(1.2)"
          },
        },
        "ring-fill": {
          "0%": { 
            strokeDashoffset: "var(--ring-offset)"
          },
          "100%": { 
            strokeDashoffset: "var(--ring-target)"
          },
        },
        "flash": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        "flame-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            filter: "drop-shadow(0 0 4px hsl(32 95% 44% / 0.6))"
          },
          "50%": { 
            transform: "scale(1.1)",
            filter: "drop-shadow(0 0 12px hsl(32 95% 54% / 0.8))"
          },
        },
        "check-bounce": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "particle-burst": {
          "0%": { 
            transform: "scale(0)",
            opacity: "1"
          },
          "100%": { 
            transform: "scale(2)",
            opacity: "0"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float-up": "float-up 1s ease-out forwards",
        "ring-fill": "ring-fill 0.8s ease-out forwards",
        "flash": "flash 0.3s ease-out",
        "flame-pulse": "flame-pulse 1.5s ease-in-out infinite",
        "check-bounce": "check-bounce 0.4s ease-out",
        "particle-burst": "particle-burst 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
