import { pool } from '../config/db.js';

export const criarCorrida = async (req, res) => {
    const { passageiro_id, origem, destino, distancia, preco_estimado } = req.body;
    if (!passageiro_id || !origem || !destino || !distancia || !preco_estimado) {
        return res.status(400).json({ erro: 'Dados incompletos para criar a corrida' });
    }
    try {
        const resultado = await pool.query(
            'INSERT INTO corridas(passageiro_id, origem, destino, distancia, preco_estimado, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            [passageiro_id, origem, destino, distancia, preco_estimado, 'pendente']
        );
        return res.status(201).json({ mensagem: 'Corrida criada com sucesso', corrida: resultado.rows[0] });
    } catch (error) {
        console.error("Erro ao criar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao criar a corrida' });
    }
};

export const listarCorridas = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM corridas ORDER BY id DESC');
        return res.status(200).json({ mensagem: 'Corridas listadas com sucesso', corridas: resultado.rows });
    } catch (error) {
        console.error("Erro ao listar as corridas:", error);
        return res.status(500).json({ erro: 'Erro interno ao listar as corridas' });
    }
};

export const buscarCorridaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('SELECT * FROM corridas WHERE id = $1', [id]);
        const corrida = resultado.rows[0];
        if (!corrida) {
            return res.status(404).json({ erro: 'Corrida não encontrada' });
        }
        return res.status(200).json({ mensagem: 'Corrida encontrada com sucesso', corrida: corrida });
    } catch (error) {
        console.error("Erro ao buscar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao buscar a corrida' });
    }
};

export const atualizarCorrida = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE corridas SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        const corridaAtualizada = resultado.rows[0];
        if (!corridaAtualizada) {
            return res.status(404).json({ erro: 'Corrida não encontrada' });
        }
        return res.status(200).json({ mensagem: 'Corrida atualizada com sucesso', corrida: corridaAtualizada });
    } catch (error) {
        console.error("Erro ao atualizar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao atualizar a corrida' });
    }
};

export const deletarCorrida = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM corridas WHERE id = $1 RETURNING *', [id]);
        const corridaDeletada = resultado.rows[0];
        if (!corridaDeletada) {
            return res.status(404).json({ erro: 'Corrida não encontrada' });
        }
        return res.status(200).json({
            mensagem: `Corrida com ID ${id} deletada com sucesso`,
            corrida: corridaDeletada
        });
    } catch (error) {
        console.error("Erro ao deletar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao deletar a corrida' });
    }
};

export const aceitarCorrida = async (req, res) => {
    const { id } = req.params;
    const { motorista_id } = req.body;
    if (!motorista_id) {
        return res.status(400).json({ erro: 'ID do motorista é obrigatório.' });
    }
    try {
        const resultado = await pool.query(
            'UPDATE corridas SET status = $1, motorista_id = $2, updated_at = NOW() WHERE id = $3 AND status = $4 RETURNING *',
            ['aceita', motorista_id, id, 'pendente']
        );
        const corridaAceita = resultado.rows[0];
        if (!corridaAceita) {
            return res.status(404).json({ erro: 'Corrida não encontrada ou já aceita.' });
        }
        return res.status(200).json({
            mensagem: 'Corrida aceita com sucesso!',
            corrida: corridaAceita
        });
    } catch (error) {
        console.error("Erro ao aceitar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao aceitar a corrida.' });
    }
};