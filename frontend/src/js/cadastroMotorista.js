/* === Bloco 1: Lógica de Cadastro do Passageiro === */
document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;

    const data = {
        nome,
        email,
        senha,
        telefone,
        tipoUsuario
    };

    try {
        const response = await fetch('http://localhost:3001/api/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            // Redireciona para a página de login
            window.location.href = 'login.html';
        } else {
            alert('Erro no cadastro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao tentar conectar com o servidor.');
    }
});