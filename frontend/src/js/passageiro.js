import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const corridaForm = document.getElementById("corridaForm");
const statusCorrida = document.getElementById("statusCorrida");

let usuarioLogado = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioLogado = user;
    console.log("Passageiro logado:", user.email);
    ouvirCorridas(user.uid);
  } else {
    window.location.href = "login.html";
  }
});

// Enviar solicitação de corrida
corridaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const origem = document.getElementById("origem").value;
  const destino = document.getElementById("destino").value;

  try {
    await addDoc(collection(db, "corridas"), {
      passageiroId: usuarioLogado.uid,
      origem,
      destino,
      status: "pendente",
      motoristaId: null,
      createdAt: new Date()
    });

    statusCorrida.innerText = "Corrida solicitada! Aguardando motorista...";
  } catch (error) {
    console.error("Erro ao solicitar corrida:", error.message);
    alert("Erro: " + error.message);
  }
});

// Escutar mudanças no status da corrida
function ouvirCorridas(uid) {
  const q = query(collection(db, "corridas"), where("passageiroId", "==", uid));

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const corrida = change.doc.data();
      if (change.type === "added" || change.type === "modified") {
        statusCorrida.innerText =
          `Status: ${corrida.status.toUpperCase()}` +
          (corrida.motoristaId ? ` | Motorista: ${corrida.motoristaId}` : "");
      }
    });
  });
}
