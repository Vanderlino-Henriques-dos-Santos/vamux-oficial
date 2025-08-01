import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, // <== CORRIGIDO AQUI PARA USAR O .env
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, // <== CORRIGIDO PARA USAR O .env
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Cliente PostgreSQL conectado.');
});

pool.on('error', (err, client) => {
    console.error('Erro inesperado no cliente PostgreSQL', err);
    process.exit(-1);
});

export {
    pool,
};