import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const cadastroForm = document.getElementById("cadastroForm");

cadastroForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const tipo = document.querySelector("input[name='tipo']:checked").value;

  try {
    // Cria usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salva dados no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome,
      email,
      tipo
    });

    alert("Cadastro realizado com sucesso!");
    if (tipo === "passageiro") {
      window.location.href = "passageiro.html";
    } else {
      window.location.href = "motorista.html";
    }
  } catch (error) {
    console.error("Erro no cadastro:", error.message);
    alert("Erro ao cadastrar: " + error.message);
  }
});
