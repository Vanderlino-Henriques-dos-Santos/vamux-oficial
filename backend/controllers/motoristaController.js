import { pool } from '../config/db.js';

export const criarMotorista = async (req, res) => {
    // ✅ CORREÇÃO: Recebendo email e senha do body
    const { nome, email, senha, cnh, telefone } = req.body;

    if (!nome || !email || !senha || !cnh || !telefone) {
        return res.status(400).json({ erro: 'Dados incompletos para criar o motorista' });
    }

    try {
        // ✅ CORREÇÃO: Inserindo email e senha no banco
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

// ... (as outras funções como listarMotoristas, etc., continuam as mesmas)
// ... (código da função criarMotorista) ...

export const listarMotoristas = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM motoristas ORDER BY id DESC');
        const motoristas = resultado.rows;
        return res.status(200).json({
            mensagem: 'Motoristas listados com sucesso',
            motoristas: motoristas
        });
    } catch (error) {
        console.error("Erro ao listar os motoristas:", error);
        return res.status(500).json({ erro: 'Erro interno ao listar os motoristas' });
    }
};
// ... (código da função listarMotoristas) ...

export const buscarMotoristaPorId = async (req, res) => {
    const { id } = req.params; // ID da URL

    try {
        const resultado = await pool.query('SELECT * FROM motoristas WHERE id = $1', [id]);
        const motorista = resultado.rows[0];

        if (!motorista) {
            return res.status(404).json({ erro: 'Motorista não encontrado' });
        }

        return res.status(200).json({
            mensagem: 'Motorista encontrado com sucesso',
            motorista: motorista
        });
    } catch (error) {
        console.error("Erro ao buscar o motorista:", error);
        return res.status(500).json({ erro: 'Erro interno ao buscar o motorista' });
    }
};
// ... (código da função buscarMotoristaPorId) ...

export const atualizarMotorista = async (req, res) => {
    const { id } = req.params; // ID da URL
    const { nome, cnh, telefone } = req.body; // Dados do Body

    try {
        const resultado = await pool.query(
            'UPDATE motoristas SET nome = $1, cnh = $2, telefone = $3 WHERE id = $4 RETURNING *',
            [nome, cnh, telefone, id]
        );

        const motoristaAtualizado = resultado.rows[0];

        if (!motoristaAtualizado) {
            return res.status(404).json({ erro: 'Motorista não encontrado' });
        }

        return res.status(200).json({
            mensagem: 'Motorista atualizado com sucesso',
            motorista: motoristaAtualizado
        });
    } catch (error) {
        console.error("Erro ao atualizar o motorista:", error);
        return res.status(500).json({ erro: 'Erro interno ao atualizar o motorista' });
    }
};
// ... (código da função atualizarMotorista) ...

export const deletarMotorista = async (req, res) => {
    const { id } = req.params; // ID da URL

    try {
        const resultado = await pool.query('DELETE FROM motoristas WHERE id = $1 RETURNING *', [id]);
        const motoristaDeletado = resultado.rows[0];

        if (!motoristaDeletado) {
            return res.status(404).json({ erro: 'Motorista não encontrado' });
        }

        return res.status(200).json({
            mensagem: `Motorista com ID ${id} deletado com sucesso`,
            motorista: motoristaDeletado
        });
    } catch (error) {
        console.error("Erro ao deletar o motorista:", error);
        return res.status(500).json({ erro: 'Erro interno ao deletar o motorista' });
    }
};