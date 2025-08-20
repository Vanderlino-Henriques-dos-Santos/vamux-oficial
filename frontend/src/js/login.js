import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    // Faz login no Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Busca dados do Firestore
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const dados = userSnap.data();

      if (dados.tipo === "passageiro") {
        window.location.href = "passageiro.html";
      } else if (dados.tipo === "motorista") {
        window.location.href = "motorista.html";
      } else {
        alert("Tipo de usuário inválido!");
      }
    } else {
      alert("Usuário não encontrado no banco!");
    }
  } catch (error) {
    console.error("Erro no login:", error.message);
    alert("Erro ao entrar: " + error.message);
  }
});
