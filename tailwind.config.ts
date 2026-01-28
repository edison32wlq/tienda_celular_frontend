import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dye: {
          bg: "#070A12",
          panel: "rgba(255,255,255,0.04)",
          panel2: "rgba(255,255,255,0.02)",
          border: "rgba(255,255,255,0.10)",
          border2: "rgba(255,255,255,0.14)",
        },
      },
      boxShadow: {
        glow:
          "0 0 0 1px rgba(255,255,255,0.05), 0 20px 80px rgba(0,0,0,0.55)",
        soft:
          "0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        "dye-radial":
          "radial-gradient(900px circle at 18% 8%, rgba(255,255,255,0.10), transparent 38%), radial-gradient(850px circle at 82% 28%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(650px circle at 50% 92%, rgba(255,255,255,0.06), transparent 45%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
