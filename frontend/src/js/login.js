// Arquivo: login.js

const formLogin = document.getElementById('formLogin');
const mensagemStatus = document.getElementById('mensagemStatus');

// Função para exibir mensagens na tela
function exibirMensagem(texto, tipo) {
    mensagemStatus.textContent = texto;
    if (tipo === 'sucesso') {
        mensagemStatus.style.color = 'green';
    } else if (tipo === 'erro') {
        mensagemStatus.style.color = 'red';
    }
}

formLogin.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const data = { email, senha };

    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            exibirMensagem('Login realizado com sucesso!', 'sucesso');
            setTimeout(() => {
                window.location.href = 'passageiro.html';
            }, 2000);
        } else {
            exibirMensagem('Erro no login: ' + result.message, 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        exibirMensagem('Erro ao tentar conectar com o servidor.', 'erro');
    }
});