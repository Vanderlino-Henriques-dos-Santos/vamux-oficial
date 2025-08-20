// -----------------------------------------
// Admin - Aprovação de Motoristas (RTDB)
// -----------------------------------------
// Lê "usuarios" na RTDB e mostra os motoristas com verificado=false.
// Permite aprovar/rejeitar (atualiza verificado na RTDB).

import { rtdb } from "./firebase-config.js";
import { ref, onValue, update } from "firebase/database";

// Elementos da página (veja admin.html abaixo)
const listaMotoristas = document.getElementById("lista-motoristas");
const mensagem = document.getElementById("mensagem");

// Observa mudanças em /usuarios
onValue(ref(rtdb, "usuarios"), (snapshot) => {
  listaMotoristas.innerHTML = ""; // Limpa
  const usuarios = snapshot.val() || {};

  let pendentes = 0;
  for (const id in usuarios) {
    const user = usuarios[id];
    if (user?.tipo === "motorista" && !user?.verificado) {
      pendentes++;
      exibirMotorista(id, user);
    }
  }

  if (pendentes === 0) {
    listaMotoristas.innerHTML = `<p class="text-gray-600">Nenhum motorista pendente de aprovação.</p>`;
  }
});

// Cria o card do motorista
function exibirMotorista(id, user) {
  const card = document.createElement("div");
  card.className =
    "rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-2";

  card.innerHTML = `
    <h3 class="text-lg font-semibold">${user?.nome ?? "Sem nome"}</h3>
    <p><strong>Email:</strong> ${user?.email ?? "-"}</p>
    <p><strong>Veículo:</strong> ${user?.modeloVeiculo ?? "-"}</p>
    <p><strong>Placa:</strong> ${user?.placaVeiculo ?? "-"}</p>

    <div class="flex flex-wrap gap-3 py-2">
      ${
        user?.cnhURL
          ? `<a class="text-violet-600 underline" href="${user.cnhURL}" target="_blank">📄 CNH</a>`
          : `<span class="text-gray-400">CNH não enviada</span>`
      }
      ${
        user?.documentoVeiculoURL
          ? `<a class="text-violet-600 underline" href="${user.documentoVeiculoURL}" target="_blank">📄 Documento Veículo</a>`
          : `<span class="text-gray-400">Doc. veículo não enviado</span>`
      }
      ${
        user?.comprovanteResidenciaURL
          ? `<a class="text-violet-600 underline" href="${user.comprovanteResidenciaURL}" target="_blank">📄 Comprovante Residência</a>`
          : `<span class="text-gray-400">Comp. residência não enviado</span>`
      }
    </div>

    <div class="flex gap-2">
      <button class="btn-aprovar bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
              data-id="${id}">✅ Aprovar</button>
      <button class="btn-rejeitar bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
              data-id="${id}">❌ Rejeitar</button>
    </div>
  `;

  // Eventos (modo moderno, sem expor no window)
  card.querySelector(".btn-aprovar")?.addEventListener("click", () => aprovarMotorista(id));
  card.querySelector(".btn-rejeitar")?.addEventListener("click", () => rejeitarMotorista(id));

  listaMotoristas.appendChild(card);
}

// Aprovar
async function aprovarMotorista(id) {
  try {
    await update(ref(rtdb, `usuarios/${id}`), { verificado: true });
    mostrarMensagem("Motorista aprovado com sucesso!", "sucesso");
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao aprovar motorista.", "erro");
  }
}

// Rejeitar
async function rejeitarMotorista(id) {
  try {
    await update(ref(rtdb, `usuarios/${id}`), { verificado: false });
    mostrarMensagem("Motorista rejeitado com sucesso.", "erro");
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao rejeitar motorista.", "erro");
  }
}

// UI: mensagens
function mostrarMensagem(texto, tipo) {
  if (!mensagem) return;
  mensagem.textContent = texto;
  mensagem.className =
    "text-sm mt-3 " + (tipo === "sucesso" ? "text-emerald-700" : "text-rose-700");

  setTimeout(() => {
    mensagem.textContent = "";
    mensagem.className = "text-sm mt-3 text-gray-500";
  }, 4000);
}
