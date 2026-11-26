/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-muted": "hsl(var(--card-muted))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          soft: "hsl(var(--accent-soft))",
          foreground: "hsl(var(--accent-foreground))",
        },
        ring: "hsl(var(--ring))",
        risk: {
          low: "hsl(var(--risk-low))",
          lowSoft: "hsl(var(--risk-low-soft))",
          medium: "hsl(var(--risk-medium))",
          mediumSoft: "hsl(var(--risk-medium-soft))",
          high: "hsl(var(--risk-high))",
          highSoft: "hsl(var(--risk-high-soft))",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 1px 2px hsl(var(--shadow) / 0.04), 0 8px 24px hsl(var(--shadow) / 0.06)",
        lift: "0 2px 4px hsl(var(--shadow) / 0.05), 0 18px 40px hsl(var(--shadow) / 0.10)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
