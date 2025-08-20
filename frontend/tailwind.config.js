/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{html,js}",   // pega todos os arquivos .html e .js na raiz do frontend
    "./src/**/*.{js,ts,jsx,tsx}" // pega arquivos JS/TSX dentro de src
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",   // roxo (VAMUX pode customizar depois)
        secondary: "#06b6d4", // ciano
        accent: "#f59e0b",    // laranja
      },
    },
  },
  plugins: [],
}
