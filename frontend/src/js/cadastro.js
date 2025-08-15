import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const formCadastro = document.getElementById('formCadastro');
const radioMotorista = document.querySelector('input[value="motorista"]');
const camposMotorista = document.getElementById('camposMotorista');
const mensagemStatus = document.getElementById('mensagemStatus');

function exibirMensagem(texto, tipo) {
    mensagemStatus.textContent = texto;
    mensagemStatus.className = `mensagem-status ${tipo}`;
}

radioMotorista.addEventListener('change', () => {
    camposMotorista.style.display = radioMotorista.checked ? 'block' : 'none';
});

formCadastro.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    const cnh = document.getElementById('cnh').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        const userData = {
            nome: nome,
            email: email,
            telefone: telefone,
            tipo: tipoUsuario,
            criadoEm: new Date(),
        };

        if (tipoUsuario === 'motorista') {
            userData.cnh = cnh;
            userData.status = 'offline';
        }

        await setDoc(doc(db, "usuarios", user.uid), userData);

        exibirMensagem('Cadastro realizado com sucesso! Redirecionando para o login...', 'sucesso');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Erro no cadastro:', error);
        let mensagemErro = 'Erro ao tentar conectar com o servidor.';
        if (error.code === 'auth/email-already-in-use') {
            mensagemErro = 'Este e-mail já está em uso.';
        } else if (error.code === 'auth/weak-password') {
            mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
        }
        exibirMensagem('Erro no cadastro: ' + mensagemErro, 'erro');
    }
});