// index.js - Inicia o servidor Express da API VAMUX

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 API VAMUX rodando em http://localhost:${PORT}`);
});
