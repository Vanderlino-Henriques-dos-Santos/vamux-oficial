// =====================================
// ARQUIVO: src/js/passageiro.js
// Função: Script principal do passageiro no VAMUX
// Inclui Firebase, mapa, estimativa e chamada de corrida
// =====================================

// === [BLOCO 1] IMPORTAÇÕES FIREBASE E CONFIGS ===
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp,
} from "firebase/database";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const database = getDatabase(app);

// === [BLOCO 2] VARIÁVEIS GLOBAIS ===
let map;
let directionsService;
let directionsRenderer;
let origemLatLng;
let destinoLatLng;
let userId;

// === [BLOCO 3] AUTENTICAÇÃO: VERIFICA USUÁRIO LOGADO ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
  } else {
    window.location.href = "login.html";
  }
});

// === [BLOCO 4] FUNÇÃO PARA CARREGAR GOOGLE MAPS COM CHAVE DO .env ===
function carregarScriptGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
  script.defer = true;
  document.head.appendChild(script);
}

// === [BLOCO 5] INICIALIZAÇÃO DO MAPA ===
window.initMap = () => {
  map = new google.maps.Map(document.getElementById("mapa"), {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 13,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  const inputOrigem = document.getElementById("origem");
  const inputDestino = document.getElementById("destino");

  const autocompleteOrigem = new google.maps.places.Autocomplete(inputOrigem);
  autocompleteOrigem.addListener("place_changed", () => {
    const place = autocompleteOrigem.getPlace();
    origemLatLng = place.geometry.location;
  });

  const autocompleteDestino = new google.maps.places.Autocomplete(inputDestino);
  autocompleteDestino.addListener("place_changed", () => {
    const place = autocompleteDestino.getPlace();
    destinoLatLng = place.geometry.location;
  });

  exibirMensagem("Mapa carregado com sucesso!", "verde");
};

// === [BLOCO 6] ESTIMAR CORRIDA ===
document.getElementById("btnEstimar").addEventListener("click", () => {
  if (!origemLatLng || !destinoLatLng) {
    exibirMensagem("Preencha origem e destino!", "vermelho");
    return;
  }

  const request = {
    origin: origemLatLng,
    destination: destinoLatLng,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (resultado, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(resultado);

      const distanciaMetros = resultado.routes[0].legs[0].distance.value;
      const duracaoSegundos = resultado.routes[0].legs[0].duration.value;

      const distanciaKm = distanciaMetros / 1000;
      const duracaoMin = Math.round(duracaoSegundos / 60);
      const valorEstimado = (distanciaKm * 2.5).toFixed(2);

      exibirMensagem(`🚘 Estimativa: ${distanciaKm.toFixed(1)} km, ${duracaoMin} min, R$ ${valorEstimado}`, "verde");
    } else {
      exibirMensagem("Erro ao calcular a rota.", "vermelho");
    }
  });
});

// === [BLOCO 7] CHAMAR CORRIDA ===
document.getElementById("btnChamar").addEventListener("click", () => {
  const inputOrigem = document.getElementById("origem").value;
  const inputDestino = document.getElementById("destino").value;

  if (!inputOrigem || !inputDestino || !origemLatLng || !destinoLatLng) {
    exibirMensagem("Complete os campos corretamente.", "vermelho");
    return;
  }

  const corridaRef = ref(database, "corridas");
  const novaCorridaRef = push(corridaRef);

  const dadosCorrida = {
    passageiroId: userId,
    origem: inputOrigem,
    destino: inputDestino,
    origemLat: origemLatLng.lat(),
    origemLng: origemLatLng.lng(),
    destinoLat: destinoLatLng.lat(),
    destinoLng: destinoLatLng.lng(),
    status: "pendente",
    timestamp: serverTimestamp(),
  };

  set(novaCorridaRef, dadosCorrida)
    .then(() => {
      exibirMensagem("Corrida solicitada com sucesso! Aguardando motorista...", "verde");
    })
    .catch((error) => {
      console.error("Erro ao salvar corrida:", error);
      exibirMensagem("Erro ao solicitar corrida.", "vermelho");
    });
});

// === [BLOCO 8] SAIR ===
document.getElementById("btnSair")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});

// === [BLOCO 9] EXIBIR MENSAGEM COM COR ===
function exibirMensagem(msg, cor) {
  const divMsg = document.getElementById("mensagem");
  divMsg.innerText = msg;
  divMsg.style.color = cor === "verde" ? "green" : "red";
  divMsg.style.fontWeight = "bold";
}

// === [BLOCO 10] EXECUTA O CARREGAMENTO DO MAPA ===
carregarScriptGoogleMaps();
