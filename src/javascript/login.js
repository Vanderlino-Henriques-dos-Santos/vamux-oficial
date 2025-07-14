// src/javascript/login.js
// === LOGIN DE USUÁRIO VAMUX ===
// Verifica credenciais e redireciona para painel de passageiro ou motorista conforme cadastro.

import { auth, database } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

// === BOTÃO DE LOGIN ===
const botaoLogin = document.getElementById("login");

botaoLogin.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Verifica se é passageiro
    const passageiroRef = ref(database, `passageiros/${user.uid}`);
    const passageiroSnap = await get(passageiroRef);

    if (passageiroSnap.exists()) {
      window.location.href = "passageiro.html";
      return;
    }

    // Verifica se é motorista
    const motoristaRef = ref(database, `motoristas/${user.uid}`);
    const motoristaSnap = await get(motoristaRef);

    if (motoristaSnap.exists()) {
      window.location.href = "motorista.html";
      return;
    }

    // Se não encontrou nenhum perfil
    alert("Perfil não encontrado. Cadastre-se novamente.");
  } catch (error) {
    alert("Erro ao fazer login: " + error.message);
  }
});
