// Arquivo: cadastro-passageiro.js

document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;

    const data = {
        nome,
        email,
        senha,
        telefone,
        tipoUsuario: 'passageiro'
    };

    try {
        const response = await fetch('http://localhost:3001/api/passageiros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Cadastro de passageiro realizado com sucesso!');
            // A linha abaixo é a que faz o redirecionamento!
            window.location.href = 'login.html';
        } else {
            alert('Erro no cadastro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar conectar com o servidor.');
    }
});