// ===========================================
// ARQUIVO: src/js/motorista.js
// Função: Painel do motorista com mapa + escuta de corridas pendentes
// ===========================================

// === [1] IMPORTAÇÕES FIREBASE ===
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  onValue,
  update,
} from "firebase/database";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const database = getDatabase(app);

// === [2] VARIÁVEIS GLOBAIS ===
let motoristaId = null;
let map;
let directionsService;
let directionsRenderer;

// === [3] VERIFICAR USUÁRIO LOGADO ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    motoristaId = user.uid;
    carregarDadosMotorista(user.uid);
    carregarScriptGoogleMaps(); // inicia o mapa ao logar
  } else {
    window.location.href = "login.html";
  }
});

// === [4] CARREGAR DADOS DO MOTORISTA NO TOPO ===
function carregarDadosMotorista(uid) {
  const refMotorista = ref(database, "motoristas/" + uid);
  get(refMotorista)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        document.getElementById("nomeMotorista").innerText = dados.nome || "-";
        document.getElementById("modeloVeiculo").innerText = dados.veiculo || "-";
        document.getElementById("placaVeiculo").innerText = dados.placa || "-";
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar dados do motorista:", err);
    });
}

// === [5] BOTÃO SAIR ===
document.getElementById("btnSair").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});

// === [6] BOTÃO FICAR ONLINE (ESCUTA CORRIDAS) ===
document.getElementById("btnOnline").addEventListener("click", () => {
  exibirMensagem("Você está online. Aguardando corridas...", "verde");

  const corridasRef = ref(database, "corridas");

  onValue(corridasRef, (snapshot) => {
    let corridaEncontrada = false;

    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const corrida = childSnapshot.val();

      if (corrida.status === "pendente" && !corridaEncontrada) {
        corridaEncontrada = true;

        exibirMensagem("🚘 Corrida encontrada!", "verde");

        // Exibir dados na tela
        const origem = corrida.origem;
        const destino = corrida.destino;
        const passageiroId = corrida.passageiroId;

        // Mostrar rota no mapa
        const origemLatLng = new google.maps.LatLng(corrida.origemLat, corrida.origemLng);
        const destinoLatLng = new google.maps.LatLng(corrida.destinoLat, corrida.destinoLng);

        const request = {
          origin: origemLatLng,
          destination: destinoLatLng,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);
          }
        });

        // Atualizar status da corrida no Firebase como "aceita"
        update(ref(database, `corridas/${key}`), {
          status: "aceita",
          motoristaId: motoristaId,
        });

        // Exibir informações
        exibirMensagem(`🧍 Passageiro solicitou: ${origem} → ${destino}`, "verde");
      }
    });

    if (!corridaEncontrada) {
      exibirMensagem("Nenhuma corrida disponível no momento.", "vermelho");
    }
  });
});

// === [7] EXIBIR MENSAGEM ===
function exibirMensagem(msg, cor) {
  const div = document.getElementById("mensagem");
  div.innerText = msg;
  div.style.color = cor === "verde" ? "green" : "red";
  div.style.fontWeight = "bold";
}

// === [8] CARREGAMENTO DO GOOGLE MAPS ===
function carregarScriptGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
  script.defer = true;
  document.head.appendChild(script);
}

// === [9] INICIALIZAÇÃO DO MAPA ===
window.initMap = () => {
  map = new google.maps.Map(document.getElementById("mapa"), {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  exibirMensagem("Mapa carregado. Pronto para corrida!", "verde");
};
