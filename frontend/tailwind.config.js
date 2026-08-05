/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0A2540",
          50: "#EAF0F7",
          100: "#CBDAEA",
          400: "#1E4F7C",
          500: "#123C66",
          600: "#0E3155",
          700: "#0A2540",
          800: "#071B2E",
          900: "#04111D",
        },
        secondary: "#123C66",
        accent: {
          DEFAULT: "#1E63FF",
          50: "#EAF0FF",
          100: "#D2E0FF",
          400: "#3E7BFF",
          500: "#1E63FF",
          600: "#144FDB",
          700: "#0D3CAD",
        },
        surface: "#F5F7FB",
        card: "#FFFFFF",
        line: "#E8EDF5",
        ink: "#1B2430",
        muted: "#5B6B82",
        success: "#12B76A",
        warning: "#F79009",
        danger: "#F04438",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10, 37, 64, 0.04), 0 4px 16px rgba(10, 37, 64, 0.06)",
        card: "0 2px 8px rgba(10, 37, 64, 0.06), 0 1px 2px rgba(10, 37, 64, 0.04)",
        lift: "0 12px 32px rgba(10, 37, 64, 0.12)",
        glass: "0 8px 32px rgba(10, 37, 64, 0.18)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0A2540 0%, #123C66 55%, #1E63FF 100%)",
        "accent-gradient": "linear-gradient(135deg, #1E63FF 0%, #3E7BFF 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        shine: {
          "100%": { transform: "translateX(100%)" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(-4deg) scale(1)" },
          "50%": { transform: "rotate(4deg) scale(1.06)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        wobble: "wobble 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
