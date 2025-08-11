import express from 'express';
import { criarPassageiro, listarPassageiros, buscarPassageiroPorId, atualizarPassageiro, deletarPassageiro } from '../controllers/passageiroController.js';

const router = express.Router();

router.post('/passageiros', criarPassageiro);
router.get('/passageiros', listarPassageiros);
router.get('/passageiros/:id', buscarPassageiroPorId);
router.put('/passageiros/:id', atualizarPassageiro);
router.delete('/passageiros/:id', deletarPassageiro);

export default router;