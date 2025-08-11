import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/passageiros', (req, res) => {
    const dadosPassageiro = req.body;
    console.log('Dados recebidos para cadastro de passageiro:', dadosPassageiro);
    if (dadosPassageiro.nome && dadosPassageiro.email && dadosPassageiro.senha) {
        res.status(201).json({
            mensagem: 'Cadastro de passageiro realizado com sucesso!',
            usuario: dadosPassageiro
        });
    } else {
        res.status(400).json({ mensagem: 'Dados incompletos para o cadastro.' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', { email, senha });

    if (email === 'teste@teste.com' && senha === '123') {
        res.status(200).json({ 
            mensagem: 'Login bem-sucedido!',
            usuario: { nome: 'A. Teste', tipo: 'passageiro' }
        });
    } else {
        res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }
});

app.post('/api/chamar-corrida', (req, res) => {
    const dadosCorrida = req.body;
    console.log('Nova solicitação de corrida:', dadosCorrida);
    
    res.status(200).json({
        mensagem: 'Corrida solicitada com sucesso! Aguardando motorista...',
        dados: dadosCorrida
    });
});

app.use(express.static(path.join(__dirname, '../../frontend')));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});