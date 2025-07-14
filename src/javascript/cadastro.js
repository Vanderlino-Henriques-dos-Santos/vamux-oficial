// src/javascript/cadastro.js
// === CADASTRO DE PASSAGEIRO OU MOTORISTA VAMUX ===
// Cria usuário no Firebase Auth e salva dados no Realtime Database

import { auth, database } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

// === Função para exibir mensagens de status ===
function exibirMensagem(texto, erro = false) {
  const msg = document.getElementById("mensagem");
  msg.innerText = texto;
  msg.style.color = erro ? "red" : "green";
}

// === Botões ===
const botaoPassageiro = document.getElementById("cadastrarPassageiro");
const botaoMotorista = document.getElementById("cadastrarMotorista");

// === CADASTRAR PASSAGEIRO ===
botaoPassageiro.addEventListener("click", async () => {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    exibirMensagem("Preencha todos os campos!", true);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await updateProfile(user, { displayName: nome });

    // Salvar dados no Realtime Database
    await set(ref(database, `passageiros/${user.uid}`), {
      nome,
      email,
    });

    exibirMensagem("Passageiro cadastrado com sucesso!");
    auth.signOut(); // Desloga após cadastro
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    exibirMensagem("Erro ao cadastrar passageiro: " + error.message, true);
  }
});

// === CADASTRAR MOTORISTA ===
botaoMotorista.addEventListener("click", async () => {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const veiculo = document.getElementById("veiculo").value;
  const placa = document.getElementById("placa").value;

  if (!nome || !email || !senha || !veiculo || !placa) {
    exibirMensagem("Preencha todos os campos!", true);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await updateProfile(user, { displayName: nome });

    // Salvar dados no Realtime Database
    await set(ref(database, `motoristas/${user.uid}`), {
      nome,
      email,
      veiculo,
      placa,
    });

    exibirMensagem("Motorista cadastrado com sucesso!");
    auth.signOut(); // Desloga após cadastro
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    exibirMensagem("Erro ao cadastrar motorista: " + error.message, true);
  }
});
