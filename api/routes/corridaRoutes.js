// === [BLOCO 1] ROTAS DE CORRIDA ===
import express from 'express';
import { criarCorrida } from '../controllers/corridaController.js';

const router = express.Router();

// Rota POST para criar uma corrida
router.post('/corridas', criarCorrida);

export default router;
