import { pool } from '../../config/db.js';

export const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // ✅ CORREÇÃO: Usando o nome da coluna 'email'
        let usuario = await pool.query('SELECT * FROM passageiros WHERE email = $1', [email]);
        let tipo = 'passageiro';

        // Se não encontrar, tenta na tabela de motoristas
        if (usuario.rows.length === 0) {
            // ✅ CORREÇÃO: Usando o nome da coluna 'email'
            usuario = await pool.query('SELECT * FROM motoristas WHERE email = $1', [email]);
            tipo = 'motorista';
        }

        if (usuario.rows.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuarioEncontrado = usuario.rows[0];

        if (usuarioEncontrado.senha !== senha) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // Se o login for bem-sucedido
        res.status(200).json({
            mensagem: 'Login bem-sucedido!',
            usuario: {
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome,
                email: usuarioEncontrado.email,
                tipo: tipo
            }
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};