// Arquivo: backend/routes/corridaRoutes.js

const express = require('express');
const router = express.Router();
const {
    solicitarCorrida,
    buscarCorridasDisponiveis,
    aceitarCorrida
} = require('../controllers/corridaController');

// Rota para solicitar uma nova corrida (passageiro)
router.post('/solicitar', solicitarCorrida);

// Rota para buscar corridas disponíveis (motorista)
router.get('/disponiveis', buscarCorridasDisponiveis);

// Rota para o motorista aceitar uma corrida
router.put('/:id/aceitar', aceitarCorrida);

// ✅ ALTERAÇÃO: Exportando como um módulo ES padrão
export default router;