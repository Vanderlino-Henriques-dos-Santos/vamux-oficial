// frontend/js/passageiro.js
import { auth, database } from './firebase-config.js';
import { onValue, ref, push, serverTimestamp, set } from 'firebase/database';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

let user;
let map;
let autocompleteOrigem, autocompleteDestino;
let directionsService, directionsRenderer;

onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
        user = firebaseUser;
        initMap();
    } else {
        window.location.href = 'login.html';
    }
});

function initMap() {
    const defaultPos = { lat: -23.55052, lng: -46.633308 }; // São Paulo
    map = new google.maps.Map(document.getElementById('mapa'), {
        center: defaultPos,
        zoom: 12,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
    initAutocomplete();
}

function initAutocomplete() {
    autocompleteOrigem = new google.maps.places.Autocomplete(
        document.getElementById('origem'),
        { fields: ['geometry', 'name'] }
    );
    autocompleteDestino = new google.maps.places.Autocomplete(
        document.getElementById('destino'),
        { fields: ['geometry', 'name'] }
    );
    // Adicionar listeners para quando um local é selecionado
}

async function solicitarCorrida() {
    const origem = autocompleteOrigem.getPlace();
    const destino = autocompleteDestino.getPlace();
    if (!origem || !destino) {
        showMensagem('Selecione um ponto de origem e destino', 'erro');
        return;
    }

    const request = {
        origin: origem.geometry.location,
        destination: destino.geometry.location,
        travelMode: 'DRIVING',
    };

    try {
        const response = await directionsService.route(request);
        const route = response.routes[0].legs[0];
        
        const corridaRef = push(ref(database, 'corridas'));
        set(corridaRef, {
            rideId: corridaRef.key,
            passageiroId: user.uid,
            origem: {
                lat: origem.geometry.location.lat(),
                lng: origem.geometry.location.lng(),
                endereco: origem.name
            },
            destino: {
                lat: destino.geometry.location.lat(),
                lng: destino.geometry.location.lng(),
                endereco: destino.name
            },
            distancia_km: (route.distance.value / 1000).toFixed(2),
            tempo_min: (route.duration.value / 60).toFixed(0),
            valor_estimado: (route.distance.value / 1000 * 3).toFixed(2), // Exemplo de cálculo
            status: 'pendente',
            createdAt: serverTimestamp(),
        });

        showMensagem('Corrida solicitada com sucesso. Aguardando motorista…', 'sucesso');
        escutarStatusCorrida(corridaRef.key);
    } catch (e) {
        showMensagem('Falha ao calcular rota/estimativa', 'erro');
    }
}

function escutarStatusCorrida(rideId) {
    const rideRef = ref(database, `corridas/${rideId}`);
    onValue(rideRef, (snapshot) => {
        const corrida = snapshot.val();
        if (!corrida) return;

        // Implementar a lógica de estados conforme a especificação
        switch (corrida.status) {
            case 'aceita':
                showMensagem('Corrida encontrada!', 'sucesso');
                break;
            case 'motorista_chegou':
                showMensagem('Seu motorista chegou.', 'sucesso');
                break;
            case 'finalizada':
                showMensagem('Corrida finalizada.', 'sucesso');
                resetUI();
                break;
            // ... demais status
        }
    });
}

function showMensagem(texto, tipo) {
    const mensagemElement = document.getElementById('mensagem-status');
    mensagemElement.textContent = texto;
    mensagemElement.className = `mensagem-status ${tipo}`;
    mensagemElement.style.display = 'block';
}

function resetUI() {
    // Limpar o mapa, mensagens, etc.
}

window.solicitarCorrida = solicitarCorrida;