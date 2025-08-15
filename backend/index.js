// Arquivo: backend/index.js

import express from 'express';
import cors from 'cors';

// Importando o módulo 'firebase-admin' completo
import firebaseAdmin from "firebase-admin";
const { initializeApp, cert } = firebaseAdmin;

import corridaRoutes from './routes/corridaRoutes.js';

// ✅ ALTERAÇÃO: Substituindo 'assert' por 'with'
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

const app = express();
const port = 3000;

// Configuração do Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

// Middleware
app.use(express.json());
app.use(cors());

// Rotas da API
app.use('/api/corridas', corridaRoutes);

app.get('/', (req, res) => {
  res.send('API VAMUX rodando com sucesso!');
});

app.listen(port, () => {
  console.log(`Servidor VAMUX rodando em http://localhost:${port}`);
});