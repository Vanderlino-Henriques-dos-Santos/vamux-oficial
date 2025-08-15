import { auth, db } from './firebase-config.js';
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, onSnapshot, query, collection, where } from "firebase/firestore";

const nomeMotoristaSpan = document.getElementById('nomeMotorista');
const statusAtualSpan = document.getElementById('statusAtual');
const btnAlternarStatus = document.getElementById('btnAlternarStatus');
const btnSair = document.getElementById('btnSair');
const painelStatus = document.getElementById('painelStatus');
const painelCorridasDisponiveis = document.getElementById('painelCorridasDisponiveis');
const listaCorridasDiv = document.getElementById('listaCorridas');
const painelCorridaAndamento = document.getElementById('painelCorridaAndamento');
const nomePassageiroAceitoSpan = document.getElementById('nomePassageiroAceito');
const destinoPassageiroAceitoSpan = document.getElementById('destinoPassageiroAceito');
const btnIniciarCorrida = document.getElementById('btnIniciarCorrida');
const btnFinalizarCorrida = document.getElementById('btnFinalizarCorrida');

let motoristaId;
let motoristaData;
let locationUpdateInterval;
let mapa;
let marcadorMotorista;
let marcadorPassageiro;
let corridaEmAndamentoRef;
let unsubscribeCorridasDisponiveis;
let unsubscribeCorridaAndamento;
let corridaAceitaData;

window.initMap = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                mapa = new google.maps.Map(document.getElementById('mapa'), { center: pos, zoom: 15 });
                marcadorMotorista = new google.maps.Marker({
                    position: pos,
                    map: mapa,
                    title: "Sua localização",
                    icon: "http://maps.google.com/mapfiles/ms/icons/car.png"
                });
            },
            () => { alert("Não foi possível obter sua localização."); }
        );
    } else {
        alert("Geolocalização não é suportada por este navegador.");
    }
};

async function carregarDadosDoMotorista() {
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado || localStorage.getItem('usuario').tipo !== 'motorista') {
        window.location.href = 'login.html';
        return;
    }
    motoristaId = usuarioLogado.uid;
    const docSnap = await getDoc(doc(db, "usuarios", motoristaId));
    if (docSnap.exists()) {
        motoristaData = docSnap.data();
        nomeMotoristaSpan.textContent = motoristaData.nome;
        atualizarStatusUI(motoristaData.status);
    } else {
        window.location.href = 'login.html';
    }
}

function atualizarStatusUI(status) {
    if (status === 'online') {
        statusAtualSpan.textContent = 'Online';
        statusAtualSpan.className = 'status-online';
        btnAlternarStatus.textContent = 'Ficar Offline';
        btnAlternarStatus.className = 'btn-offline';
        painelCorridasDisponiveis.style.display = 'block';
    } else {
        statusAtualSpan.textContent = 'Offline';
        statusAtualSpan.className = 'status-offline';
        btnAlternarStatus.textContent = 'Ficar Online';
        btnAlternarStatus.className = 'btn-online';
        painelCorridasDisponiveis.style.display = 'none';
        painelCorridaAndamento.style.display = 'none';
    }
}

async function atualizarLocalizacaoMotorista() {
    if (!motoristaId) return;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await updateDoc(doc(db, "usuarios", motoristaId), {
                    localizacao: { lat: latitude, lng: longitude, timestamp: new Date() }
                });
            },
            (error) => { console.error("Erro ao obter localização:", error); }
        );
    }
}

async function alternarStatus() {
    const novoStatus = motoristaData.status === 'online' ? 'offline' : 'online';
    try {
        await updateDoc(doc(db, "usuarios", motoristaId), { status: novoStatus });
        motoristaData.status = novoStatus;
        atualizarStatusUI(novoStatus);
        
        if (novoStatus === 'online') {
            ouvirCorridasDisponiveis();
            atualizarLocalizacaoMotorista();
            locationUpdateInterval = setInterval(atualizarLocalizacaoMotorista, 5000);
        } else {
            clearInterval(locationUpdateInterval);
            if (unsubscribeCorridasDisponiveis) unsubscribeCorridasDisponiveis();
        }
    } catch (error) {
        alert("Erro ao mudar o status. Tente novamente.");
    }
}

function ouvirCorridasDisponiveis() {
    painelCorridasDisponiveis.style.display = 'block';
    const q = query(collection(db, "corridas"), where("status", "==", "pendente"));
    
    unsubscribeCorridasDisponiveis = onSnapshot(q, (querySnapshot) => {
        listaCorridasDiv.innerHTML = '';
        if (querySnapshot.empty) {
            listaCorridasDiv.innerHTML = '<p class="mensagem-status">Nenhuma corrida disponível no momento.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const corrida = doc.data();
                const card = document.createElement('div');
                card.className = 'corrida-card';
                card.innerHTML = `<p><strong>Origem:</strong> ${corrida.origem.endereco}</p><p><strong>Destino:</strong> ${corrida.destino.endereco}</p><button class="btn-aceitar" data-id="${doc.id}">Aceitar Corrida</button>`;
                listaCorridasDiv.appendChild(card);
            });
        }
    });
}

async function aceitarCorrida(corridaId) {
    const corridaRef = doc(db, "corridas", corridaId);
    try {
        await updateDoc(corridaRef, { status: 'aceita', motoristaId: motoristaId, motoristaNome: motoristaData.nome, aceitaEm: new Date() });
        alert("Corrida aceita! Indo para a corrida...");
        painelCorridasDisponiveis.style.display = 'none';
        corridaEmAndamentoRef = corridaRef;
        ouvirCorridaEmAndamento(corridaId);
        if (unsubscribeCorridasDisponiveis) unsubscribeCorridasDisponiveis();
    } catch (error) {
        alert("Erro ao aceitar corrida. Tente novamente.");
    }
}

function ouvirCorridaEmAndamento(corridaId) {
    const corridaRef = doc(db, "corridas", corridaId);
    unsubscribeCorridaAndamento = onSnapshot(corridaRef, async (docSnap) => {
        const corrida = docSnap.data();
        corridaAceitaData = corrida;

        if (corrida.status === 'aceita' || corrida.status === 'in_progress') {
            const passageiroRef = doc(db, "usuarios", corrida.passageiroId);
            const passageiroSnap = await getDoc(passageiroRef);
            if(passageiroSnap.exists()){
                const passageiroData = passageiroSnap.data();
                nomePassageiroAceitoSpan.textContent = passageiroData.nome;
                destinoPassageiroAceitoSpan.textContent = corrida.destino.endereco;
                painelCorridaAndamento.style.display = 'block';
                const passageiroPos = new google.maps.LatLng(corrida.origem.lat, corrida.origem.lng);
                if (!marcadorPassageiro) {
                     marcadorPassageiro = new google.maps.Marker({ position: passageiroPos, map: mapa, title: "Local do Passageiro", icon: "http://maps.google.com/mapfiles/ms/icons/man.png" });
                } else {
                    marcadorPassageiro.setPosition(passageiroPos);
                }
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(marcadorMotorista.getPosition());
                bounds.extend(marcadorPassageiro.getPosition());
                mapa.fitBounds(bounds);
                
                if (corrida.status === 'in_progress') {
                    btnIniciarCorrida.style.display = 'none';
                    btnFinalizarCorrida.style.display = 'block';
                }
            }
        } else if (corrida.status === 'completed') {
            limparEstadoCorrida();
            alert("Corrida finalizada com sucesso!");
        }
    });
}

function calcularValorCorrida(origem, destino, tempoInicio, tempoFim) {
    const service = new google.maps.DistanceMatrixService();
    return new Promise((resolve, reject) => {
        service.getDistanceMatrix({
            origins: [origem],
            destinations: [destino],
            travelMode: 'DRIVING',
        }, (response, status) => {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                const distancia_metros = response.rows[0].elements[0].distance.value;
                const distancia_km = distancia_metros / 1000;
                const duracao_minutos = Math.floor((tempoFim - tempoInicio) / 1000 / 60);
                const valor_corrida = 5.00 + (distancia_km * 1.50) + (duracao_minutos * 0.50);
                resolve({ distancia_km: distancia_km.toFixed(2), duracao_minutos: duracao_minutos, valor_corrida: valor_corrida.toFixed(2) });
            } else {
                reject('Erro ao calcular a distância da corrida.');
            }
        });
    });
}

async function iniciarCorrida() {
    if (!corridaEmAndamentoRef) return;
    try {
        await updateDoc(corridaEmAndamentoRef, { status: 'in_progress' });
        alert("Corrida iniciada!");
    } catch (error) {
        console.error("Erro ao iniciar corrida:", error);
    }
}

async function finalizarCorrida() {
    if (!corridaEmAndamentoRef) return;
    const tempoFim = new Date();
    const tempoInicio = corridaAceitaData.aceitaEm.toDate();
    try {
        const { distancia_km, duracao_minutos, valor_corrida } = await calcularValorCorrida(
            new google.maps.LatLng(corridaAceitaData.origem.lat, corridaAceitaData.origem.lng),
            new google.maps.LatLng(corridaAceitaData.destino.lat, corridaAceitaData.destino.lng),
            tempoInicio,
            tempoFim
        );
        await updateDoc(corridaEmAndamentoRef, {
            status: 'completed',
            finalizadaEm: tempoFim,
            distancia_km: distancia_km,
            duracao_minutos: duracao_minutos,
            valor_corrida: valor_corrida,
        });
    } catch (error) {
        console.error("Erro ao finalizar corrida:", error);
    }
}

function limparEstadoCorrida() {
    if (unsubscribeCorridaAndamento) unsubscribeCorridaAndamento();
    corridaEmAndamentoRef = null;
    painelCorridaAndamento.style.display = 'none';
    painelCorridasDisponiveis.style.display = 'block';
    if (marcadorPassageiro) { marcadorPassageiro.setMap(null); marcadorPassageiro = null; }
    btnIniciarCorrida.style.display = 'block';
    btnFinalizarCorrida.style.display = 'none';
    if (motoristaData.status === 'online') { ouvirCorridasDisponiveis(); }
}

document.addEventListener('DOMContentLoaded', carregarDadosDoMotorista);
btnAlternarStatus.addEventListener('click', alternarStatus);
btnSair.addEventListener('click', async () => {
    try {
        if (motoristaData.status === 'online') {
            clearInterval(locationUpdateInterval);
            await updateDoc(doc(db, "usuarios", motoristaId), { status: 'offline' });
        }
        await signOut(auth);
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
});
painelCorridasDisponiveis.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-aceitar')) {
        aceitarCorrida(e.target.dataset.id);
    }
});
btnIniciarCorrida.addEventListener('click', iniciarCorrida);
btnFinalizarCorrida.addEventListener('click', finalizarCorrida);