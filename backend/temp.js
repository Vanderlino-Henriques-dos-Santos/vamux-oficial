import { pool } from '../config/db.js';

export const criarCorrida = async (req, res) => {
    console.log("📥 Body recebido:", req.body);

    const { passageiroId, origem, destino, distancia, precoEstimado } = req.body;

    if (!passageiroId || !origem || !destino || !distancia || !precoEstimado) {
        return res.status(400).json({ erro: 'Dados incompletos para criar a corrida' });
    }

    try {
        const resultado = await pool.query(
            'INSERT INTO corridas(passageiroId, origem, destino, distancia, precoEstimado, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            [passageiroId, origem, destino, distancia, precoEstimado, 'pendente']
        );

        const novaCorrida = resultado.rows[0];

        console.log("✅ Corrida criada no banco de dados:", novaCorrida);

        return res.status(201).json({
            mensagem: 'Corrida criada com sucesso',
            corrida: novaCorrida
        });
    } catch (error) {
        console.error("❌ Erro ao criar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao criar a corrida' });
    }
};

export const listarCorridas = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM corridas ORDER BY id DESC');
        const corridas = resultado.rows;

        return res.status(200).json({
            mensagem: 'Corridas listadas com sucesso',
            corridas: corridas
        });
    } catch (error) {
        console.error("❌ Erro ao listar as corridas:", error);
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

        return res.status(200).json({
            mensagem: 'Corrida encontrada com sucesso',
            corrida: corrida
        });
    } catch (error) {
        console.error("❌ Erro ao buscar a corrida:", error);
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

        return res.status(200).json({
            mensagem: 'Corrida atualizada com sucesso',
            corrida: corridaAtualizada
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar a corrida:", error);
        return res.status(500).json({ erro: 'Erro interno ao atualizar a corrida' });
    }
};