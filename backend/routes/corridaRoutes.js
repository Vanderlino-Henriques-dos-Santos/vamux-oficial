// === [BLOCO 1] ROTAS DE CORRIDA ===
import express from 'express';
import {
    criarCorrida,
    listarCorridas,
    buscarCorridaPorId,
    atualizarCorrida,
    deletarCorrida,
    aceitarCorrida // ✅ Importando a nova função
} from '../controllers/corridaController.js';

const router = express.Router();

// Rotas de CRUD para corridas
router.post('/corridas', criarCorrida);
router.get('/corridas', listarCorridas);
router.get('/corridas/:id', buscarCorridaPorId);
router.put('/corridas/:id', atualizarCorrida);
router.delete('/corridas/:id', deletarCorrida);

// ✅ Rota específica para o motorista aceitar uma corrida
router.put('/corridas/aceitar/:id', aceitarCorrida);

export default router;