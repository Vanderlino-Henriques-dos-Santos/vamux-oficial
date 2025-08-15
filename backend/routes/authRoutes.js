// Arquivo: backend/routes/authRoutes.js
import { Router } from 'express';
import { login, cadastro } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/cadastro', cadastro); // Rota única para cadastro

export default router;