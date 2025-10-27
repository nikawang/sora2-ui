/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "spark-fly-1": {
          "0%": { transform: "translate(-50%, -50%) translate(0, 0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) translate(-8px, -12px)", opacity: "0" },
        },
        "spark-fly-2": {
          "0%": { transform: "translate(-50%, -50%) translate(0, 0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) translate(10px, -10px)", opacity: "0" },
        },
        "spark-fly-3": {
          "0%": { transform: "translate(-50%, -50%) translate(0, 0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) translate(14px, -2px)", opacity: "0" },
        },
        "spark-fly-4": {
          "0%": { transform: "translate(-50%, -50%) translate(0, 0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) translate(10px, 8px)", opacity: "0" },
        },
        "spark-fly-5": {
          "0%": { transform: "translate(-50%, -50%) translate(0, 0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) translate(-4px, 10px)", opacity: "0" },
        },
        "spark-core": {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "1" },
          "50%": { transform: "translate(-50%, -50%) scale(1.5)", opacity: "0.6" },
        },
        "car-bounce": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        "spark-fly-1": "spark-fly-1 0.8s ease-out infinite",
        "spark-fly-2": "spark-fly-2 0.9s ease-out infinite",
        "spark-fly-3": "spark-fly-3 0.7s ease-out infinite",
        "spark-fly-4": "spark-fly-4 0.85s ease-out infinite",
        "spark-fly-5": "spark-fly-5 0.75s ease-out infinite",
        "spark-core": "spark-core 0.6s ease-in-out infinite",
        "car-bounce": "car-bounce 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
