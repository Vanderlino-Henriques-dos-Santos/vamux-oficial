// === admin.js ===
// Painel para listar verificações de motoristas, aprovar ou rejeitar

import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  update
} from "firebase/database";

// === 1. Configuração do Firebase ===
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// === 2. Seleciona o container da interface ===
const painelVerificacoes = document.getElementById("painelVerificacoes");

// === 3. Buscar todas as verificações no Firebase ===
const verificacoesRef = ref(database, "verificacoes");

onValue(verificacoesRef, (snapshot) => {
  const dados = snapshot.val();
  painelVerificacoes.innerHTML = ""; // limpa conteúdo anterior

  if (!dados) {
    painelVerificacoes.innerHTML = "<p>Nenhuma verificação encontrada.</p>";
    return;
  }

  // Cria um card para cada verificação
  Object.entries(dados).forEach(([id, verif]) => {
    const card = document.createElement("div");
    card.classList.add("card-verificacao");

    card.innerHTML = `
      <h3>Motorista: ${id}</h3>
      <p>Status: <strong>${verif.status}</strong></p>
      <p><a href="${verif.cnhURL}" target="_blank">📄 CNH</a></p>
      <p><a href="${verif.veiculoURL}" target="_blank">🚗 Documento do Veículo</a></p>
      <p><a href="${verif.comprovanteURL}" target="_blank">🏠 Comprovante de Residência</a></p>
      <div class="botoes">
        <button class="btn-aprovar" data-id="${id}">Aprovar</button>
        <button class="btn-rejeitar" data-id="${id}">Rejeitar</button>
      </div>
      <hr />
    `;

    painelVerificacoes.appendChild(card);
  });

  ativarBotoes();
});

// === 4. Função para ativar os botões após renderizar ===
function ativarBotoes() {
  const btnsAprovar = document.querySelectorAll(".btn-aprovar");
  const btnsRejeitar = document.querySelectorAll(".btn-rejeitar");

  btnsAprovar.forEach((btn) => {
    btn.addEventListener("click", () => atualizarStatus(btn.dataset.id, "aprovado"));
  });

  btnsRejeitar.forEach((btn) => {
    btn.addEventListener("click", () => atualizarStatus(btn.dataset.id, "rejeitado"));
  });
}

// === 5. Atualiza o status da verificação no Firebase ===
function atualizarStatus(id, novoStatus) {
  const refStatus = ref(database, `verificacoes/${id}`);
  update(refStatus, { status: novoStatus })
    .then(() => alert(`Status atualizado para ${novoStatus}`))
    .catch((err) => alert("Erro ao atualizar status: " + err.message));
}
