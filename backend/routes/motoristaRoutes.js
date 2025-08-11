// === [BLOCO 2] ROTAS DE MOTORISTA ===
import express from 'express';
import { criarMotorista, listarMotoristas, buscarMotoristaPorId, atualizarMotorista, deletarMotorista } from '../controllers/motoristaController.js';

const router = express.Router();

// Rota POST para criar um motorista
router.post('/motoristas', criarMotorista);

// Rota GET para listar todos os motoristas
router.get('/motoristas', listarMotoristas);

// Rota GET para buscar um motorista por ID
router.get('/motoristas/:id', buscarMotoristaPorId);

// Rota PUT para atualizar um motorista por ID
router.put('/motoristas/:id', atualizarMotorista);

// Rota DELETE para deletar um motorista por ID
router.delete('/motoristas/:id', deletarMotorista);

export default router;