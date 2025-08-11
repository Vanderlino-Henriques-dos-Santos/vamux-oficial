import { pool } from '../config/db.js';

export const criarPassageiro = async (req, res) => {
    // ✅ CORREÇÃO: Recebendo email e senha do body
    const { nome, email, senha, telefone } = req.body;
    if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ erro: 'Dados incompletos para criar o passageiro' });
    }
    try {
        // ✅ CORREÇÃO: Inserindo email e senha no banco
        const resultado = await pool.query(
            'INSERT INTO passageiros(nome, email, senha, telefone) VALUES($1, $2, $3, $4) RETURNING *',
            [nome, email, senha, telefone]
        );
        const novoPassageiro = resultado.rows[0];
        return res.status(201).json({
            mensagem: 'Passageiro criado com sucesso',
            passageiro: novoPassageiro
        });
    } catch (error) {
        console.error("Erro ao criar o passageiro:", error);
        return res.status(500).json({ erro: 'Erro interno ao criar o passageiro' });
    }
};

// ... (as outras funções como listarPassageiros, etc., continuam as mesmas)

export const listarPassageiros = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM passageiros ORDER BY id DESC');
        const passageiros = resultado.rows;
        return res.status(200).json({
            mensagem: 'Passageiros listados com sucesso',
            passageiros: passageiros
        });
    } catch (error) {
        console.error("Erro ao listar os passageiros:", error);
        return res.status(500).json({ erro: 'Erro interno ao listar os passageiros' });
    }
};

export const buscarPassageiroPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('SELECT * FROM passageiros WHERE id = $1', [id]);
        const passageiro = resultado.rows[0];
        if (!passageiro) {
            return res.status(404).json({ erro: 'Passageiro não encontrado' });
        }
        return res.status(200).json({
            mensagem: 'Passageiro encontrado com sucesso',
            passageiro: passageiro
        });
    } catch (error) {
        console.error("Erro ao buscar o passageiro:", error);
        return res.status(500).json({ erro: 'Erro interno ao buscar o passageiro' });
    }
};

export const atualizarPassageiro = async (req, res) => {
    const { id } = req.params;
    const { nome, telefone } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE passageiros SET nome = $1, telefone = $2 WHERE id = $3 RETURNING *',
            [nome, telefone, id]
        );
        const passageiroAtualizado = resultado.rows[0];
        if (!passageiroAtualizado) {
            return res.status(404).json({ erro: 'Passageiro não encontrado' });
        }
        return res.status(200).json({
            mensagem: 'Passageiro atualizado com sucesso',
            passageiro: passageiroAtualizado
        });
    } catch (error) {
        console.error("Erro ao atualizar o passageiro:", error);
        return res.status(500).json({ erro: 'Erro interno ao atualizar o passageiro' });
    }
};

export const deletarPassageiro = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM passageiros WHERE id = $1 RETURNING *', [id]);
        const passageiroDeletado = resultado.rows[0];
        if (!passageiroDeletado) {
            return res.status(404).json({ erro: 'Passageiro não encontrado' });
        }
        return res.status(200).json({
            mensagem: `Passageiro com ID ${id} deletado com sucesso`,
            passageiro: passageiroDeletado
        });
    } catch (error) {
        console.error("Erro ao deletar o passageiro:", error);
        return res.status(500).json({ erro: 'Erro interno ao deletar o passageiro' });
    }
};