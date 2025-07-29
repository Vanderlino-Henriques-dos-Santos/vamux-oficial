// === [BLOCO 1] IMPORTAÇÕES ===
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Carrega variáveis do .env
dotenv.config();

const app = express();

// === [BLOCO 2] MIDDLEWARES ===
app.use(cors());
app.use(express.json());

// === [BLOCO 3] ROTA DE TESTE ===
app.get("/api/teste", (req, res) => {
  res.json({ mensagem: "✅ API do VAMUX funcionando perfeitamente!" });
});

// === [BLOCO 4] PORTA E INICIALIZAÇÃO DO SERVIDOR ===
const PORT = process.env.PORT || 3001; // ou 4000, 5000 etc.


app.listen(PORT, () => {
  console.log(`🚀 API VAMUX rodando em http://localhost:${PORT}`);
});
