// === BLOCO 00: CARREGAMENTO DO GOOGLE MAPS COM VARIÁVEL SEGURA ===
function carregarGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

carregarGoogleMaps();

// === BLOCO 01: IMPORTAÇÕES FIREBASE ===
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  serverTimestamp
} from "firebase/database";
import { app } from "./firebase-config.js";

// === BLOCO 02: VARIÁVEIS GLOBAIS ===
const auth = getAuth(app);
const database = getDatabase(app);
let map, directionsService, directionsRenderer;
let origemLatLng = null;
let destinoLatLng = null;
let enderecoOrigem = "";
let enderecoDestino = "";

// === BLOCO 03: FUNÇÃO PARA MENSAGENS NA TELA ===
function mostrarMensagem(texto, tipo = "sucesso") {
  const mensagemEl = document.getElementById("mensagem");
  if (!mensagemEl) return;
  mensagemEl.innerHTML = texto;
  mensagemEl.className = `mensagem ${tipo}`;
}

// === BLOCO 04: INICIALIZA MAPA + AUTOCOMPLETE ===
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

  if (inputOrigem && inputDestino) {
    const autocompleteOrigem = new google.maps.places.Autocomplete(inputOrigem);
    autocompleteOrigem.addListener("place_changed", () => {
      const place = autocompleteOrigem.getPlace();
      if (place.geometry) {
        origemLatLng = place.geometry.location;
        enderecoOrigem = place.formatted_address || inputOrigem.value;
        inputOrigem.value = enderecoOrigem;
      }
    });

    const autocompleteDestino = new google.maps.places.Autocomplete(inputDestino);
    autocompleteDestino.addListener("place_changed", () => {
      const place = autocompleteDestino.getPlace();
      if (place.geometry) {
        destinoLatLng = place.geometry.location;
        enderecoDestino = place.formatted_address || inputDestino.value;
        inputDestino.value = enderecoDestino;
      }
    });
  }
};

// === BLOCO 05: ESTIMAR DISTÂNCIA E VALOR ===
document.getElementById("btnEstimativa").addEventListener("click", () => {
  if (!origemLatLng || !destinoLatLng) {
    mostrarMensagem("❌ Preencha corretamente os endereços.", "erro");
    return;
  }

  const request = {
    origin: origemLatLng,
    destination: destinoLatLng,
    travelMode: "DRIVING",
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);

      const distanciaKm = result.routes[0].legs[0].distance.value / 1000;
      const duracaoMin = result.routes[0].legs[0].duration.value / 60;
      const valorEstimado = (distanciaKm * 2.5).toFixed(2);

      mostrarMensagem(
        `📍 <strong>Distância:</strong> ${distanciaKm.toFixed(2)} km<br>
         ⏱️ <strong>Duração:</strong> ${duracaoMin.toFixed(0)} min<br>
         💰 <strong>Valor estimado:</strong> R$ ${valorEstimado}`,
        "sucesso"
      );
    } else {
      mostrarMensagem("❌ Erro ao calcular rota. Tente novamente.", "erro");
    }
  });
});

// === BLOCO 06: CHAMAR CORRIDA ===
document.getElementById("btnChamarCorrida").addEventListener("click", () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      mostrarMensagem("❌ Você precisa estar logado para solicitar uma corrida.", "erro");
      return;
    }

    const passageiroEmail = user.email || "não identificado";

    if (!origemLatLng || !destinoLatLng) {
      mostrarMensagem("❌ Preencha todos os dados da corrida antes de continuar.", "erro");
      return;
    }

    const corridaRef = ref(database, "corridas");

    push(corridaRef, {
      passageiro: passageiroEmail,
      origem: {
        lat: origemLatLng.lat(),
        lng: origemLatLng.lng(),
        endereco: enderecoOrigem || document.getElementById("origem").value,
      },
      destino: {
        lat: destinoLatLng.lat(),
        lng: destinoLatLng.lng(),
        endereco: enderecoDestino || document.getElementById("destino").value,
      },
      status: "pendente",
      timestamp: serverTimestamp(),
    });

    mostrarMensagem("🚗 Corrida solicitada com sucesso!", "sucesso");
  });
});
