// Arquivo: backend/controllers/passageiroController.js

import { pool } from '../config/db.js';

/**
 * Cria um novo passageiro no banco de dados.
 * @param {object} req - Objeto de requisição do Express
 * @param {object} res - Objeto de resposta do Express
 */
export const criarPassageiro = async (req, res) => {
    // Extrai os dados do corpo da requisição
    const { nome, email, senha, telefone } = req.body;

    // Validação básica para garantir que todos os campos obrigatórios foram enviados
    if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ erro: 'Dados incompletos para criar o passageiro' });
    }

    try {
        // Insere o novo passageiro no banco de dados
        const resultado = await pool.query(
            'INSERT INTO passageiros(nome, email, senha, telefone) VALUES($1, $2, $3, $4) RETURNING *',
            [nome, email, senha, telefone]
        );
        const novoPassageiro = resultado.rows[0];
        
        // Retorna uma resposta de sucesso
        return res.status(201).json({
            mensagem: 'Passageiro criado com sucesso',
            passageiro: novoPassageiro
        });
    } catch (error) {
        console.error("Erro ao criar o passageiro:", error);
        // Retorna um erro interno do servidor
        return res.status(500).json({ erro: 'Erro interno ao criar o passageiro' });
    }
};

// As outras funções como listar, buscar, atualizar e deletar passageiros podem ser implementadas aqui.
// Por enquanto, vamos focar no que é essencial para o login e cadastro.