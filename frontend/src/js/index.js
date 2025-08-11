/* === Bloco 3: Rota de Login no Backend === */
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Lógica para verificar o usuário no banco de dados
    // (Por enquanto, vamos usar uma lógica simples)
    if (email === 'teste@teste.com' && senha === '123') {
        res.status(200).json({ message: 'Login bem-sucedido!', token: 'um-token-de-exemplo' });
    } else {
        res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
});