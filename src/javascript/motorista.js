// ==========================================
// 🟣 VAMUX - motorista.js
// 🎯 Funções: ficar online, escutar corrida, aceitar, traçar rota, finalizar, detectar cancelamento
// ==========================================

/* [1] IMPORTS E INICIALIZAÇÕES */
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  update,
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from "./firebase-config.js";

// Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Variáveis globais
let map, directionsService, directionsRenderer;
let idCorridaAtual = null;

/* [2] INICIAR MAPA */
window.initMap = () => {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  map = new google.maps.Map(document.getElementById("mapa"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 13,
  });

  directionsRenderer.setMap(map);
};

/* [3] CLIQUE EM "FICAR ONLINE" */
document.getElementById("btnOnline").addEventListener("click", () => {
  mostrarStatus("Você está online e aguardando corridas...");
  escutarCorridasPendentes();
});

/* [4] ESCUTAR CORRIDAS PENDENTES */
function escutarCorridasPendentes() {
  const corridasRef = ref(database, "corridas");

  onValue(corridasRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const corridas = Object.entries(data);
    const agora = Date.now();

    const pendenteRecente = corridas.find(([id, corrida]) =>
      corrida.status === "pendente" &&
      new Date(corrida.timestamp).getTime() > (agora - 10 * 60000) // últimos 10min
    );

    if (pendenteRecente) {
      const [id, corrida] = pendenteRecente;
      exibirCorrida(id, corrida);
    }
  });
}

/* [5] EXIBIR CORRIDA NA TELA DO MOTORISTA */
function exibirCorrida(id, dados) {
  idCorridaAtual = id;
  document.getElementById("info").innerHTML = `
    <p><strong>Passageiro:</strong> ${dados.nomePassageiro}</p>
    <p><strong>Origem:</strong> ${dados.origem}</p>
    <p><strong>Destino:</strong> ${dados.destino}</p>
    <button id="aceitarBtn" class="btn">Aceitar Corrida</button>
  `;

  document.getElementById("aceitarBtn").addEventListener("click", () => {
    aceitarCorrida(id, dados.origem);
  });
}

/* [6] ACEITAR CORRIDA E TRAÇAR ROTA */
function aceitarCorrida(id, enderecoPartida) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const motoristaRef = ref(database, `corridas/${id}`);
      update(motoristaRef, {
        status: "aceita",
        motoristaId: user.uid,
        nomeMotorista: user.displayName || "Motorista",
        veiculo: "Sedan",
        placa: "ABC-1234"
      });

      mostrarStatus("Corrida aceita! Rota traçada até o passageiro.");
      traçarRota(enderecoPartida);
      escutarCancelamento(id);
      exibirBotaoFinalizar();
    }
  });
}

/* [7] TRAÇAR ROTA ATÉ O PASSAGEIRO */
function traçarRota(enderecoPartida) {
  directionsService.route({
    origin: "Sua localização atual", // opcional: capturar GPS real
    destination: enderecoPartida,
    travelMode: google.maps.TravelMode.DRIVING
  }, (res, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(res);
    }
  });
}

/* [8] ESCUTAR CANCELAMENTO PELO PASSAGEIRO */
function escutarCancelamento(idCorrida) {
  const refCorrida = ref(database, `corridas/${idCorrida}`);

  onValue(refCorrida, (snapshot) => {
    const dados = snapshot.val();
    if (!dados) return;

    if (dados.status === "cancelada") {
      mostrarStatus("Corrida cancelada pelo passageiro. Você receberá taxa de cancelamento.");
      resetPainel();
    }

    if (dados.status === "finalizada") {
      mostrarStatus("Corrida finalizada com sucesso.");
      resetPainel();
    }
  });
}

/* [9] EXIBIR BOTÃO FINALIZAR */
function exibirBotaoFinalizar() {
  document.getElementById("finalizarBtn").style.display = "inline-block";

  document.getElementById("finalizarBtn").addEventListener("click", () => {
    const corridaRef = ref(database, `corridas/${idCorridaAtual}`);
    update(corridaRef, {
      status: "finalizada"
    });
    mostrarStatus("Corrida finalizada.");
    resetPainel();
  });
}

/* [10] MOSTRAR MENSAGEM DE STATUS */
function mostrarStatus(mensagem) {
  const statusDiv = document.getElementById("mensagemStatus");
  statusDiv.innerText = mensagem;
  statusDiv.style.color = mensagem.includes("cancelada") ? "red" : "green";
}

/* [11] RESET VISUAL DO PAINEL */
function resetPainel() {
  document.getElementById("info").innerHTML = "";
  document.getElementById("finalizarBtn").style.display = "none";
  directionsRenderer.set('directions', null);
  idCorridaAtual = null;
}
