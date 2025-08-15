// Arquivo: backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

// Configuração do banco de dados usando variáveis de ambiente
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => console.log('Cliente PostgreSQL conectado.'));
pool.on('error', (err) => {
    console.error('Erro inesperado no cliente PostgreSQL', err);
    process.exit(-1);
});

export { pool };