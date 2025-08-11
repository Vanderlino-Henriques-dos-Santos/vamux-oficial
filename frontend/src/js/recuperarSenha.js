// recuperarSenha.js
// === BLOCO 1: IMPORTAÇÕES FIREBASE ===
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase-config.js"; // Configuração do Firebase

// === BLOCO 2: REFERÊNCIAS HTML ===
const recuperarSenhaForm = document.getElementById("recuperarSenhaForm");
const emailRecuperacaoInput = document.getElementById("emailRecuperacao");
const mensagemRecuperacao = document.getElementById("mensagemRecuperacao");

// === BLOCO 3: EXIBE MENSAGENS AO USUÁRIO ===
function exibirMensagem(texto, isErro = false) {
  mensagemRecuperacao.textContent = texto;
  mensagemRecuperacao.style.display = "block";
  mensagemRecuperacao.className = isErro ? "mensagem-erro" : "mensagem-sucesso";

  setTimeout(() => {
    mensagemRecuperacao.textContent = "";
    mensagemRecuperacao.className = "";
    mensagemRecuperacao.style.display = "none";
  }, 5000);
}

// === BLOCO 4: ENVIO DO FORMULÁRIO ===
recuperarSenhaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailRecuperacaoInput.value.trim();

  if (!email) {
    exibirMensagem("Por favor, digite seu e-mail.", true);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    exibirMensagem("Um link de redefinição de senha foi enviado para o seu e-mail.");
    recuperarSenhaForm.reset();
  } catch (error) {
    let mensagemErro = "";
    switch (error.code) {
      case "auth/invalid-email":
        mensagemErro = "Formato de e-mail inválido.";
        break;
      case "auth/user-not-found":
        mensagemErro = "E-mail não encontrado na plataforma.";
        break;
      default:
        mensagemErro = "Erro ao enviar link: " + error.message;
        break;
    }
    exibirMensagem(mensagemErro, true);
    console.error("Erro na recuperação de senha:", error);
  }
});
