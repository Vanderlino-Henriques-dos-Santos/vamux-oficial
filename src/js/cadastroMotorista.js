// === cadastro-motorista.js ===
// Cadastro de Motorista com Firebase Auth e Realtime Database

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const form = document.getElementById("formCadastro");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");
const veiculoInput = document.getElementById("veiculo");
const placaInput = document.getElementById("placa");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.style.display = "block";
  mensagem.style.color = tipo === "erro" ? "red" : "green";
  setTimeout(() => {
    mensagem.textContent = "";
    mensagem.style.display = "none";
  }, 4000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;
  const veiculo = veiculoInput.value.trim();
  const placa = placaInput.value.trim();

  if (senha !== confirmarSenha) {
    mostrarMensagem("As senhas não coincidem.", "erro");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const userId = cred.user.uid;

    await set(ref(database, `usuarios/${userId}`), {
      nome,
      email,
      tipo: "motorista",
      veiculo,
      placa,
      createdAt: new Date().toISOString(),
    });

    mostrarMensagem("Motorista cadastrado com sucesso!", "sucesso");

    await signOut(auth);
    form.reset();

    setTimeout(() => {
      window.location.href = "/login.html";
    }, 1500);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      mostrarMensagem("Este e-mail já está em uso.", "erro");
    } else {
      mostrarMensagem("Erro ao cadastrar. Tente novamente.", "erro");
    }
    console.error(error);
  }
});
