import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  theme: {
    extend: {
      animation: {
        grow: "grow 3s ease-in-out forwards",
        ripple: "ripple 3s infinite",
        float: "float 5s infinite ease-in-out",
      },
      keyframes: {
        grow: {
          "0%": { width: "0%" },
          "100%": { width: "40%" },
        },
        ripple: {
          "0%": {
            transform: "translate(-50%, -50%) scale(0.5)",
            opacity: "0.7",
          },
          "100%": {
            transform: "translate(-50%, -50%) scale(1.5)",
            opacity: "0",
          },
        },
        float: {
          "0%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" },
          "100%": { transform: "translateY(0) translateX(0)" },
        },
      },
    },
  },
});
