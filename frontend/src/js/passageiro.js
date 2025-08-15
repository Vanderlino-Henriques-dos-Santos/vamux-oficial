import { auth, db } from './firebase-config.js';
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";

const nomePassageiroSpan = document.getElementById('nomePassageiro');
const btnSair = document.getElementById('btnSair');
const btnSolicitarCorrida = document.getElementById('btnSolicitarCorrida');
const inputDestino = document.getElementById('destino');
const painelSolicitacao = document.getElementById('painelSolicitacao');
const painelCorridaAndamento = document.getElementById('painelCorridaAndamento');
const statusAtualCorridaSpan = document.getElementById('statusAtualCorrida');
const infoMotoristaDiv = document.getElementById('infoMotorista');
const nomeMotoristaAceitouSpan = document.getElementById('nomeMotoristaAceitou');
const telefoneMotoristaSpan = document.getElementById('telefoneMotorista');
const btnCancelarCorrida = document.getElementById('btnCancelarCorrida');

const painelAvaliacao = document.getElementById('painelAvaliacao');
const distanciaCorridaSpan = document.getElementById('distanciaCorrida');
const duracaoCorridaSpan = document.getElementById('duracaoCorrida');
const valorCorridaSpan = document.getElementById('valorCorrida');
const containerEstrelasDiv = document.getElementById('containerEstrelas');
const comentarioAvaliacaoTextarea = document.getElementById('comentarioAvaliacao');
const btnEnviarAvaliacao = document.getElementById('btnEnviarAvaliacao');

let passageiroData;
let passageiroId;
let mapa;
let marcadorOrigem;
let marcadorDestino;
let marcadorMotorista;
let autocomplete;
let corridaEmAndamentoRef;
let unsubscribe;
let unsubscribeMotorista;
let valorAvaliacao = 0;

window.initMap = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                mapa = new google.maps.Map(document.getElementById('mapa'), { center: pos, zoom: 15 });
                marcadorOrigem = new google.maps.Marker({ position: pos, map: mapa, title: "Sua localização" });
                autocomplete = new google.maps.places.Autocomplete(inputDestino);
                autocomplete.bindTo('bounds', mapa);
            },
            () => { alert("Não foi possível obter sua localização."); }
        );
    } else {
        alert("Geolocalização não é suportada por este navegador.");
    }
};

async function carregarDadosDoPassageiro() {
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) { window.location.href = 'login.html'; return; }

    passageiroId = usuarioLogado.uid;
    const docSnap = await getDoc(doc(db, "usuarios", passageiroId));

    if (docSnap.exists()) {
        passageiroData = docSnap.data();
        nomePassageiroSpan.textContent = passageiroData.nome;
    } else {
        window.location.href = 'login.html';
    }
}

async function solicitarCorrida() {
    if (!autocomplete || !autocomplete.getPlace()) {
        alert("Por favor, selecione um destino válido da lista.");
        return;
    }

    const destinoPlace = autocomplete.getPlace();
    btnSolicitarCorrida.disabled = true;

    try {
        const corridaData = {
            passageiroId: passageiroId,
            passageiroNome: passageiroData.nome,
            origem: {
                lat: marcadorOrigem.getPosition().lat(),
                lng: marcadorOrigem.getPosition().lng(),
                endereco: "Sua localização"
            },
            destino: {
                lat: destinoPlace.geometry.location.lat(),
                lng: destinoPlace.geometry.location.lng(),
                endereco: destinoPlace.formatted_address
            },
            status: 'pendente',
            solicitadaEm: new Date(),
        };

        const docRef = await addDoc(collection(db, "corridas"), corridaData);
        corridaEmAndamentoRef = docRef;

        painelSolicitacao.style.display = 'none';
        painelCorridaAndamento.style.display = 'block';
        statusAtualCorridaSpan.textContent = "Buscando motorista...";

        ouvirStatusDaCorrida();

    } catch (error) {
        console.error("Erro ao solicitar corrida:", error);
        alert("Erro ao solicitar a corrida. Tente novamente.");
        btnSolicitarCorrida.disabled = false;
    }
}

function ouvirStatusDaCorrida() {
    if (!corridaEmAndamentoRef) return;

    unsubscribe = onSnapshot(corridaEmAndamentoRef, async (docSnap) => {
        if (docSnap.exists()) {
            const corrida = docSnap.data();
            
            if (corrida.status === 'aceita') {
                statusAtualCorridaSpan.textContent = "Motorista a caminho!";
                const motoristaRef = doc(db, "usuarios", corrida.motoristaId);
                const motoristaSnap = await getDoc(motoristaRef);
                if (motoristaSnap.exists()) {
                    const motoristaData = motoristaSnap.data();
                    nomeMotoristaAceitouSpan.textContent = motoristaData.nome;
                    telefoneMotoristaSpan.textContent = motoristaData.telefone;
                    infoMotoristaDiv.style.display = 'block';
                    ouvirLocalizacaoDoMotorista(corrida.motoristaId);
                }
            } else if (corrida.status === 'in_progress') {
                statusAtualCorridaSpan.textContent = "Corrida em andamento!";
            } else if (corrida.status === 'completed') {
                painelCorridaAndamento.style.display = 'none';
                painelAvaliacao.style.display = 'block';
                
                distanciaCorridaSpan.textContent = corrida.distancia_km;
                duracaoCorridaSpan.textContent = corrida.duracao_minutos;
                valorCorridaSpan.textContent = corrida.valor_corrida;
                
                if (unsubscribeMotorista) unsubscribeMotorista();
                if (marcadorMotorista) {
                    marcadorMotorista.setMap(null);
                    marcadorMotorista = null;
                }
            }
        }
    });
}

function ouvirLocalizacaoDoMotorista(motoristaId) {
    const motoristaRef = doc(db, "usuarios", motoristaId);
    
    unsubscribeMotorista = onSnapshot(motoristaRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().localizacao) {
            const motorista = docSnap.data();
            const motoristaPos = new google.maps.LatLng(motorista.localizacao.lat, motorista.localizacao.lng);
            
            if (!marcadorMotorista) {
                marcadorMotorista = new google.maps.Marker({
                    position: motoristaPos,
                    map: mapa,
                    title: motorista.nome,
                    icon: "http://maps.google.com/mapfiles/ms/icons/car.png"
                });
            } else {
                marcadorMotorista.setPosition(motoristaPos);
            }
            
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(marcadorOrigem.getPosition());
            bounds.extend(marcadorMotorista.getPosition());
            mapa.fitBounds(bounds);
        }
    });
}

function limparEstadoCorrida() {
    painelCorridaAndamento.style.display = 'none';
    painelSolicitacao.style.display = 'block';
    btnSolicitarCorrida.disabled = false;
    infoMotoristaDiv.style.display = 'none';
    if (unsubscribe) unsubscribe();
    if (unsubscribeMotorista) unsubscribeMotorista();
    corridaEmAndamentoRef = null;
    if (marcadorMotorista) {
        marcadorMotorista.setMap(null);
        marcadorMotorista = null;
    }
    // Reinicializa a tela de avaliação
    valorAvaliacao = 0;
    containerEstrelasDiv.querySelectorAll('.estrela').forEach(e => e.classList.remove('selecionada'));
    comentarioAvaliacaoTextarea.value = '';
}

async function cancelarCorrida() {
    if (!corridaEmAndamentoRef) return;

    try {
        await updateDoc(corridaEmAndamentoRef, { status: 'cancelada' });
        alert("Corrida cancelada com sucesso.");
        limparEstadoCorrida();
    } catch (error) {
        console.error("Erro ao cancelar corrida:", error);
        alert("Erro ao cancelar a corrida. Tente novamente.");
    }
}

document.addEventListener('DOMContentLoaded', carregarDadosDoPassageiro);
btnSair.addEventListener('click', async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
});
btnSolicitarCorrida.addEventListener('click', solicitarCorrida);
btnCancelarCorrida.addEventListener('click', cancelarCorrida);

containerEstrelasDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('estrela')) {
        const estrelas = containerEstrelasDiv.querySelectorAll('.estrela');
        const valorClicado = parseInt(e.target.dataset.valor);
        valorAvaliacao = valorClicado;
        estrelas.forEach(estrela => {
            if (parseInt(estrela.dataset.valor) <= valorClicado) {
                estrela.classList.add('selecionada');
            } else {
                estrela.classList.remove('selecionada');
            }
        });
    }
});

btnEnviarAvaliacao.addEventListener('click', async () => {
    if (valorAvaliacao === 0) {
        alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
        return;
    }
    
    const comentario = comentarioAvaliacaoTextarea.value;
    
    try {
        await updateDoc(corridaEmAndamentoRef, {
            avaliacao_passageiro: {
                nota: valorAvaliacao,
                comentario: comentario,
                avaliadoEm: new Date(),
            }
        });
        
        alert("Avaliação enviada com sucesso! Obrigado!");
        limparEstadoCorrida();
        painelAvaliacao.style.display = 'none';
        painelSolicitacao.style.display = 'block';
        
    } catch (error) {
        console.error("Erro ao enviar avaliação:", error);
        alert("Não foi possível enviar sua avaliação. Tente novamente.");
    }
});