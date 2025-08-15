import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const formLogin = document.getElementById('formLogin');
const mensagemStatus = document.getElementById('mensagemStatus');

function exibirMensagem(texto, tipo) {
    mensagemStatus.textContent = texto;
    mensagemStatus.className = `mensagem-status ${tipo}`;
}

formLogin.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            localStorage.setItem('usuario', JSON.stringify(userData));

            exibirMensagem('Login realizado com sucesso! Redirecionando...', 'sucesso');

            setTimeout(() => {
                if (userData.tipo === 'passageiro') {
                    window.location.href = 'passageiro.html';
                } else if (userData.tipo === 'motorista') {
                    window.location.href = 'motorista.html';
                }
            }, 2000);
        } else {
            console.error("Dados do usuário não encontrados no Firestore.");
            exibirMensagem('Erro no login: dados do usuário incompletos.', 'erro');
        }

    } catch (error) {
        console.error('Erro no login:', error);
        let mensagemErro = 'Erro ao tentar conectar com o servidor.';
        if (error.code === 'auth/invalid-credential') {
            mensagemErro = 'E-mail ou senha incorretos.';
        } else if (error.code === 'auth/user-not-found') {
            mensagemErro = 'Usuário não encontrado.';
        }
        exibirMensagem('Erro no login: ' + mensagemErro, 'erro');
    }
});