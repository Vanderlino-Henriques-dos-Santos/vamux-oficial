// === [BLOCO 1] IMPORTAÇÕES FIREBASE ===
// Importa os módulos necessários do Firebase
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "./firebase-config.js";

// === [BLOCO 2] INICIALIZAÇÕES ===
// Inicializa os serviços do Firebase
const auth = getAuth(app);
const database = getDatabase(app);

// Captura os elementos do DOM
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnEntrar = document.getElementById("btn-entrar");
const mensagemStatus = document.getElementById("mensagemStatus");

// === [BLOCO 3] EVENTO DE LOGIN ===
btnEntrar.addEventListener("click", async (e) => {
  e.preventDefault(); // Impede o reload da página

  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    exibirMensagem("Preencha todos os campos!", false);
    return;
  }

  try {
    // Faz o login com Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const userId = userCredential.user.uid;

    // Busca o tipo do usuário no Realtime Database
    const snapshot = await get(ref(database, `usuarios/${userId}`));

    if (snapshot.exists()) {
      const dados = snapshot.val();
      const tipo = dados.tipo;

      exibirMensagem("Login realizado com sucesso!", true);

      // Redireciona de acordo com o tipo de usuário
      setTimeout(() => {
        if (tipo === "passageiro") {
          window.location.href = "passageiro.html";
        } else if (tipo === "motorista") {
          window.location.href = "motorista.html";
        } else {
          exibirMensagem("Tipo de usuário inválido!", false);
        }
      }, 1000);
    } else {
      exibirMensagem("Usuário não encontrado no banco de dados.", false);
    }
  } catch (erro) {
    console.error("Erro no login:", erro.message);
    exibirMensagem("E-mail ou senha inválidos.", false);
  }
});

// === [BLOCO 4] EXIBIÇÃO DE MENSAGEM NA TELA ===
function exibirMensagem(texto, sucesso = true) {
  mensagemStatus.innerText = texto;
  mensagemStatus.style.color = sucesso ? "#28a745" : "#dc3545";
}
