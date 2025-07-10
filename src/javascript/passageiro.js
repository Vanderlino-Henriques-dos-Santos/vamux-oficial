// passageiro.js
// =====================================
// 1. IMPORTAÇÕES FIREBASE
// =====================================
import { getDatabase, ref, push, set } from "firebase/database";
import { auth } from "./firebase-config.js";

// =====================================
// 2. VARIÁVEIS GLOBAIS
// =====================================
let mapa;
let directionsService;
let directionsRenderer;
let partidaAutocomplete;
let destinoAutocomplete;

// =====================================
// 3. FUNÇÃO PARA CARREGAR GOOGLE MAPS VIA SCRIPT EXTERNO
// =====================================
function carregarGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// =====================================
// 4. FUNÇÃO PRINCIPAL PARA INICIAR O MAPA
// =====================================
window.initMap = () => {
  mapa = new google.maps.Map(document.getElementById("mapa"), {
    center: { lat: -23.5505, lng: -46.6333 }, // SP como padrão
    zoom: 13,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(mapa);

  const inputPartida = document.getElementById("partida");
  const inputDestino = document.getElementById("destino");

  partidaAutocomplete = new google.maps.places.Autocomplete(inputPartida);
  destinoAutocomplete = new google.maps.places.Autocomplete(inputDestino);
};

// =====================================
// 5. FUNÇÃO PARA CALCULAR ESTIMATIVA DE ROTA
// =====================================
function calcularEstimativa() {
  const partida = document.getElementById("partida").value;
  const destino = document.getElementById("destino").value;

  if (!partida || !destino) {
    exibirMensagem("Preencha os dois endereços.", "erro");
    return;
  }

  const request = {
    origin: partida,
    destination: destino,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);

      const distanciaMetros = result.routes[0].legs[0].distance.value;
      const duracaoMinutos = result.routes[0].legs[0].duration.value / 60;
      const valorEstimado = (distanciaMetros / 1000) * 2.5; // R$2,50 por KM

      exibirMensagem(
        `Distância: ${(distanciaMetros / 1000).toFixed(2)} km<br>Tempo: ${Math.round(duracaoMinutos)} min<br>Valor estimado: R$ ${valorEstimado.toFixed(2)}`,
        "sucesso"
      );

      salvarCorrida(partida, destino, distanciaMetros, duracaoMinutos, valorEstimado);
    } else {
      exibirMensagem("Erro ao calcular rota: " + status, "erro");
    }
  });
}

// =====================================
// 6. FUNÇÃO PARA SALVAR DADOS NO FIREBASE
// =====================================
function salvarCorrida(partida, destino, distancia, duracao, valor) {
  const user = auth.currentUser;
  if (!user) {
    exibirMensagem("Usuário não autenticado.", "erro");
    return;
  }

  const database = getDatabase();
  const corridasRef = ref(database, "corridas");
  const novaCorridaRef = push(corridasRef);

  set(novaCorridaRef, {
    passageiro: user.uid,
    partida,
    destino,
    distancia,
    duracao,
    valor,
    status: "pendente",
    timestamp: Date.now(),
  });
}

// =====================================
// 7. FUNÇÃO PARA EXIBIR MENSAGENS
// =====================================
function exibirMensagem(texto, tipo) {
  const msgDiv = document.querySelector(".mensagem-status");
  msgDiv.innerHTML = texto;
  msgDiv.style.color = tipo === "erro" ? "red" : "green";
}

// =====================================
// 8. EVENTO DE CLIQUE NO BOTÃO ESTIMATIVA
// =====================================
document.getElementById("btnEstimativa").addEventListener("click", calcularEstimativa);

// =====================================
// 9. INICIAR GOOGLE MAPS AO CARREGAR
// =====================================
carregarGoogleMaps();
