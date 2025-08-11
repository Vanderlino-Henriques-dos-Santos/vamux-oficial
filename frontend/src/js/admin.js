// === BLOCO 1: IMPORTAÇÕES DO FIREBASE ===
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "./firebase-config.js";

// === BLOCO 2: INICIALIZAÇÕES ===
const database = getDatabase(app);
const listaMotoristas = document.getElementById("lista-motoristas");
const mensagem = document.getElementById("mensagem");

// === BLOCO 3: BUSCA MOTORISTAS NÃO VERIFICADOS ===
onValue(ref(database, "usuarios"), (snapshot) => {
  listaMotoristas.innerHTML = ""; // Limpa a lista
  const usuarios = snapshot.val();

  for (let id in usuarios) {
    const user = usuarios[id];
    if (user.tipo === "motorista" && user.verificado === false) {
      exibirMotorista(id, user);
    }
  }

  if (!listaMotoristas.innerHTML) {
    listaMotoristas.innerHTML = "<p>Nenhum motorista pendente de aprovação.</p>";
  }
});

// === BLOCO 4: FUNÇÃO PARA EXIBIR MOTORISTA NA TELA ===
function exibirMotorista(id, user) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h3>${user.nome}</h3>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Veículo:</strong> ${user.modeloVeiculo || "Não informado"}</p>
    <p><strong>Placa:</strong> ${user.placaVeiculo || "Não informado"}</p>

    <div class="docs">
      <a href="${user.cnhURL}" target="_blank">📄 CNH</a>
      <a href="${user.documentoVeiculoURL}" target="_blank">📄 Documento do Veículo</a>
      <a href="${user.comprovanteResidenciaURL}" target="_blank">📄 Comprovante de Residência</a>
    </div>

    <div class="botoes">
      <button class="btn-aprovar" onclick="aprovarMotorista('${id}')">✅ Aprovar</button>
      <button class="btn-rejeitar" onclick="rejeitarMotorista('${id}')">❌ Rejeitar</button>
    </div>
  `;

  listaMotoristas.appendChild(card);
}

// === BLOCO 5: FUNÇÃO DE APROVAR MOTORISTA ===
window.aprovarMotorista = async (id) => {
  try {
    await update(ref(database, `usuarios/${id}`), {
      verificado: true,
    });
    mostrarMensagem("Motorista aprovado com sucesso!", "sucesso");
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao aprovar motorista.", "erro");
  }
};

// === BLOCO 6: FUNÇÃO DE REJEITAR MOTORISTA ===
window.rejeitarMotorista = async (id) => {
  try {
    await update(ref(database, `usuarios/${id}`), {
      verificado: false,
    });
    mostrarMensagem("Motorista rejeitado com sucesso.", "erro");
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao rejeitar motorista.", "erro");
  }
};

// === BLOCO 7: EXIBIR MENSAGEM VISUAL ===
function mostrarMensagem(texto, tipo) {
  mensagem.innerText = texto;
  mensagem.style.color = tipo === "sucesso" ? "#28a745" : "#dc3545";

  setTimeout(() => {
    mensagem.innerText = "";
  }, 4000);
}
