// ================================
// 🟣 VAMUX - cadastro.js
// 📄 Realiza o cadastro no Firebase
// ================================

// ✅ [1] Importações Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { firebaseConfig } from "./firebase-config.js";

// ✅ [2] Inicialização Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ✅ [3] Elementos do DOM
const form = document.getElementById("formCadastro");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const tipoUsuario = document.querySelector('input[name="tipo"]:checked');
const veiculoInput = document.getElementById("veiculo");
const placaInput = document.getElementById("placa");
const statusMsg = document.getElementById("mensagemStatus");

// ✅ [4] Função mostrar mensagem colorida
function mostrarMensagem(texto, cor = "green") {
  statusMsg.textContent = texto;
  statusMsg.style.color = cor;
}

// ✅ [5] Evento de envio do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
  const veiculo = veiculoInput.value.trim();
  const placa = placaInput.value.trim();

  if (!nome || !email || !senha || !tipo) {
    mostrarMensagem("Preencha todos os campos!", "red");
    return;
  }

  try {
    // ✅ [6] Cria usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const userId = userCredential.user.uid;

    // ✅ [7] Salva dados no Realtime Database
    const userRef = ref(database, `usuarios/${userId}`);
    const dadosUsuario = {
      nome,
      email,
      tipo,
      ...(tipo === "motorista" && { veiculo, placa }),
    };
    await set(userRef, dadosUsuario);

    mostrarMensagem("Cadastro efetuado com sucesso!", "green");

    // ✅ [8] Força logout após cadastro
    await signOut(auth);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao cadastrar: " + error.message, "red");
  }
});
