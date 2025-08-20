import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, query, where, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const listaCorridas = document.getElementById("listaCorridas");

let motoristaLogado = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    motoristaLogado = user;
    console.log("Motorista logado:", user.email);
    ouvirCorridasPendentes();
  } else {
    window.location.href = "login.html";
  }
});

// Escutar corridas pendentes
function ouvirCorridasPendentes() {
  const q = query(collection(db, "corridas"), where("status", "==", "pendente"));

  onSnapshot(q, (snapshot) => {
    listaCorridas.innerHTML = ""; // limpa a lista
    snapshot.forEach((docSnap) => {
      const corrida = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Origem:</strong> ${corrida.origem} <br>
        <strong>Destino:</strong> ${corrida.destino} <br>
        <button data-id="${docSnap.id}" class="aceitar">Aceitar corrida</button>
      `;
      listaCorridas.appendChild(li);
    });

    // Eventos nos botões de aceitar
    document.querySelectorAll(".aceitar").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const corridaId = btn.getAttribute("data-id");
        await aceitarCorrida(corridaId);
      });
    });
  });
}

// Aceitar corrida
async function aceitarCorrida(corridaId) {
  try {
    const corridaRef = doc(db, "corridas", corridaId);
    await updateDoc(corridaRef, {
      motoristaId: motoristaLogado.uid,
      status: "em andamento"
    });
    alert("Corrida aceita! Agora em andamento.");

    // botão para finalizar corrida
    const btnFinalizar = document.createElement("button");
    btnFinalizar.innerText = "Finalizar Corrida";
    btnFinalizar.onclick = async () => {
      await updateDoc(corridaRef, { status: "finalizada" });
      alert("Corrida finalizada!");
    };
    listaCorridas.innerHTML = "";
    listaCorridas.appendChild(btnFinalizar);

  } catch (error) {
    console.error("Erro ao aceitar corrida:", error.message);
    alert("Erro: " + error.message);
  }
}
