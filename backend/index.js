import 'dotenv/config'; // Carrega as variáveis de ambiente do .env
import express from 'express';
import cors from 'cors'; // Para permitir requisições de outras origens
import { pool } from './config/db.js'; // Importa o pool de conexão

// Importa as rotas de corrida
import corridaRoutes from './routes/corridaRoutes.js'; 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Usa as rotas de corrida
app.use('/api', corridaRoutes);

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor VAMUX-BACKEND está no ar!');
});

// Tenta conectar ao banco de dados e inicia o servidor
pool.connect()
    .then(client => {
        console.log('Conectado ao PostgreSQL com sucesso.');
        client.release();
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Falha ao conectar com o PostgreSQL:', err.stack);
    });