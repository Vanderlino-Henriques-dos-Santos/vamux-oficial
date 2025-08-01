// === [BLOCO 1] CONTROLLER DE CORRIDA (COM BANCO DE DADOS) ===
import { pool } from '../config/db.js'; // Importa o pool de conexão do banco

export const criarCorrida = async (req, res) => {
    console.log("📥 Body recebido:", req.body);

    const { passageiroId, origem, destino, distancia, precoEstimado } = req.body;

    if (!passageiroId || !origem || !destino || !distancia || !precoEstimado) {
        return res.status(400).json({ erro: 'Dados incompletos para criar a corrida' });
    }

    try {
        // Insere a nova corrida no banco de dados
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