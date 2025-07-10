// ================================
// 🟣 VAMUX - login.js
// 📥 Login de usuário com redirecionamento
// ================================

// ✅ [1] Importações Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { firebaseConfig } from "./firebase-config.js";

// ✅ [2] Inicialização Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ✅ [3] Elementos do DOM
const form = document.getElementById("formLogin");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const mensagemStatus = document.getElementById("mensagemStatus");

// ✅ [4] Função mostrar mensagem colorida
function mostrarMensagem(texto, cor = "red") {
  mensagemStatus.textContent = texto;
  mensagemStatus.style.color = cor;
}

// ✅ [5] Evento de login
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!email || !senha) {
    mostrarMensagem("Preencha todos os campos!", "red");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const userId = userCredential.user.uid;

    // ✅ [6] Verifica tipo de usuário no banco
    const userRef = ref(database, `usuarios/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      mostrarMensagem("Usuário não encontrado!", "red");
      return;
    }

    const tipo = snapshot.val().tipo;

    if (tipo === "passageiro") {
      window.location.href = "passageiro.html";
    } else if (tipo === "motorista") {
      window.location.href = "motorista.html";
    } else {
      mostrarMensagem("Tipo de usuário inválido!", "red");
    }
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao fazer login: " + error.message, "red");
  }
});
