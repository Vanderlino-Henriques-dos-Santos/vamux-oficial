// Arquivo: backend/controllers/authController.js
import { pool } from '../config/db.js';

export const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        let usuario = await pool.query('SELECT * FROM passageiros WHERE email = $1', [email]);
        let tipo = 'passageiro';

        if (usuario.rows.length === 0) {
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

export const cadastro = async (req, res) => {
    const { tipoUsuario, nome, email, senha, telefone, cnh } = req.body;

    if (!tipoUsuario || !nome || !email || !senha || !telefone) {
        return res.status(400).json({ erro: 'Dados incompletos para o cadastro.' });
    }

    try {
        if (tipoUsuario === 'passageiro') {
            await pool.query(
                'INSERT INTO passageiros(nome, email, senha, telefone) VALUES($1, $2, $3, $4)',
                [nome, email, senha, telefone]
            );
        } else if (tipoUsuario === 'motorista') {
            if (!cnh) {
                return res.status(400).json({ erro: 'Número da CNH é obrigatório para motoristas.' });
            }
            await pool.query(
                'INSERT INTO motoristas(nome, email, senha, cnh, telefone) VALUES($1, $2, $3, $4, $5)',
                [nome, email, senha, cnh, telefone]
            );
        } else {
            return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
        }
        
        res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ erro: 'Erro interno ao cadastrar.' });
    }
};