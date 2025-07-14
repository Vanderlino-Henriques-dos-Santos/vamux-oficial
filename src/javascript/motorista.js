// === BLOCO 00: CARREGAMENTO DO GOOGLE MAPS COM VARIÁVEL SEGURA (.env) ===
function carregarGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

carregarGoogleMaps();

// === BLOCO 01: IMPORTAÇÕES DO FIREBASE ===
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  onChildAdded,
  update
} from "firebase/database";
import { app } from "./firebase-config.js";

// === BLOCO 02: VARIÁVEIS GLOBAIS ===
const auth = getAuth(app);
const database = getDatabase(app);
let map, directionsService, directionsRenderer;
let motoristaOnline = false;
let motoristaEmail = null;
let corridaAtualId = null;

// === BLOCO 03: MENSAGENS NA TELA ===
function mostrarMensagem(texto, tipo = "sucesso") {
  const info = document.getElementById("infoCorrida");
  if (!info) return;
  info.innerHTML = texto;
  info.className = `mensagem ${tipo}`;
}

// === BLOCO 04: INICIALIZA O MAPA ===
window.initMap = () => {
  map = new google.maps.Map(document.getElementById("mapa"), {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 13,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
};

// === BLOCO 05: BOTÃO FICAR ONLINE ===
document.getElementById("btnFicarOnline").addEventListener("click", () => {
  motoristaOnline = true;
  mostrarMensagem("🟢 Aguardando corridas pendentes...", "sucesso");
  escutarCorridas();
});

// === BLOCO 06: ESCUTAR CORRIDAS PENDENTES ===
function escutarCorridas() {
  const corridasRef = ref(database, "corridas");

  onChildAdded(corridasRef, (snapshot) => {
    const dados = snapshot.val();
    const corridaId = snapshot.key;

    // Só aceita se for nova e ainda não tiver corrida em andamento
    if (dados.status === "pendente" && motoristaOnline && !corridaAtualId) {
      corridaAtualId = corridaId;

      const origem = { lat: dados.origem.lat, lng: dados.origem.lng };
      const destino = { lat: dados.destino.lat, lng: dados.destino.lng };

      // Mostrar info no painel
      mostrarMensagem(
        `📍 Corrida encontrada de <strong>${dados.origem.endereco || "origem desconhecida"}</strong> até <strong>${dados.destino.endereco || "destino desconhecido"}</strong><br>
         🧍 Passageiro: ${dados.passageiro || "não identificado"}<br><br>
         <button id="btnFinalizarCorrida">Finalizar Corrida</button>`,
        "sucesso"
      );

      // Traçar rota
      directionsService.route(
        {
          origin: origem,
          destination: destino,
          travelMode: "DRIVING",
        },
        (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);

            // Atualiza status para "aceita"
            update(ref(database, `corridas/${corridaId}`), {
              status: "aceita",
              motorista: motoristaEmail || "Motorista VAMUX",
            });

            motoristaOnline = false; // Evita pegar outras corridas
          } else {
            mostrarMensagem("❌ Erro ao traçar rota.", "erro");
          }
        }
      );

      // Espera botão ser criado no DOM para adicionar evento
      setTimeout(() => {
        const btnFinalizar = document.getElementById("btnFinalizarCorrida");
        if (btnFinalizar) {
          btnFinalizar.addEventListener("click", () => finalizarCorrida(corridaId));
        }
      }, 500);
    }
  });
}

// === BLOCO 07: FINALIZAR CORRIDA ===
function finalizarCorrida(corridaId) {
  if (!corridaId) return;

  update(ref(database, `corridas/${corridaId}`), {
    status: "finalizada",
  });

  mostrarMensagem("✅ Corrida finalizada com sucesso! Aguardando nova chamada...", "sucesso");
  directionsRenderer.setDirections({ routes: [] }); // limpa rota
  corridaAtualId = null;
  motoristaOnline = true; // volta a escutar novas
}
 
// === BLOCO 08: VERIFICAR LOGIN ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    motoristaEmail = user.email;
  } else {
    mostrarMensagem("❌ Você precisa estar logado para aceitar corridas.", "erro");
  }
});
