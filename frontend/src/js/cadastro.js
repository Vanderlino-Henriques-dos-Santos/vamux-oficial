// Arquivo: cadastro.js

const formCadastro = document.getElementById('formCadastro');
const mensagemStatus = document.getElementById('mensagemStatus');
const tipoRadios = document.querySelectorAll('input[name="tipoUsuario"]');
const camposMotorista = document.getElementById("camposMotorista");

tipoRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        camposMotorista.style.display = radio.value === "motorista" ? "block" : "none";
    });
});

function exibirMensagem(texto, tipo) {
    mensagemStatus.textContent = texto;
    if (tipo === 'sucesso') {
        mensagemStatus.style.color = 'green';
    } else if (tipo === 'erro') {
        mensagemStatus.style.color = 'red';
    }
}

formCadastro.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    const cnh = tipoUsuario === 'motorista' ? document.getElementById('cnh').value : null;

    const data = { nome, email, senha, telefone, tipoUsuario, cnh };

    try {
        const response = await fetch('http://localhost:3001/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            exibirMensagem(result.message, 'sucesso');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            exibirMensagem('Erro no cadastro: ' + result.message, 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        exibirMensagem('Erro ao tentar conectar com o servidor.', 'erro');
    }
});