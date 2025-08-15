// Arquivo: backend/controllers/motoristaController.js

import { pool } from '../config/db.js';

/**
 * Cria um novo motorista no banco de dados.
 * @param {object} req - Objeto de requisição do Express
 * @param {object} res - Objeto de resposta do Express
 */
export const criarMotorista = async (req, res) => {
    const { nome, email, senha, cnh, telefone } = req.body;

    if (!nome || !email || !senha || !cnh || !telefone) {
        return res.status(400).json({ erro: 'Dados incompletos para criar o motorista' });
    }

    try {
        const resultado = await pool.query(
            'INSERT INTO motoristas(nome, email, senha, cnh, telefone) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [nome, email, senha, cnh, telefone]
        );
        const novoMotorista = resultado.rows[0];
        return res.status(201).json({
            mensagem: 'Motorista criado com sucesso',
            motorista: novoMotorista
        });
    } catch (error) {
        console.error("Erro ao criar o motorista:", error);
        return res.status(500).json({ erro: 'Erro interno ao criar o motorista' });
    }
};

// ... (as outras funções para motoristas podem ser implementadas aqui)