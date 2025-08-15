// Arquivo: backend/controllers/corridaController.js

const { db } = require('../firebaseConfig');
const { collection, addDoc, getDoc, doc, updateDoc, query, where, getDocs } = require('firebase/firestore');

// Função para solicitar uma nova corrida
exports.solicitarCorrida = async (req, res) => {
    try {
        const novaCorrida = req.body;
        novaCorrida.status = 'pendente';
        novaCorrida.solicitadaEm = new Date();
        const docRef = await addDoc(collection(db, "corridas"), novaCorrida);
        res.status(201).send({ id: docRef.id, message: "Corrida solicitada com sucesso!" });
    } catch (error) {
        console.error("Erro ao solicitar corrida:", error);
        res.status(500).send({ message: "Erro interno do servidor." });
    }
};

// Função para buscar corridas disponíveis (pendentes)
exports.buscarCorridasDisponiveis = async (req, res) => {
    try {
        const q = query(collection(db, "corridas"), where("status", "==", "pendente"));
        const querySnapshot = await getDocs(q);
        const corridas = [];
        querySnapshot.forEach((doc) => {
            corridas.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).send(corridas);
    } catch (error) {
        console.error("Erro ao buscar corridas disponíveis:", error);
        res.status(500).send({ message: "Erro interno do servidor." });
    }
};

// Função para o motorista aceitar uma corrida
exports.aceitarCorrida = async (req, res) => {
    try {
        const { motoristaId, motoristaNome } = req.body;
        const corridaId = req.params.id;

        const corridaRef = doc(db, "corridas", corridaId);
        await updateDoc(corridaRef, {
            status: 'aceita',
            motoristaId: motoristaId,
            motoristaNome: motoristaNome,
            aceitaEm: new Date(),
        });
        res.status(200).send({ message: "Corrida aceita com sucesso!" });
    } catch (error) {
        console.error("Erro ao aceitar corrida:", error);
        res.status(500).send({ message: "Erro interno do servidor." });
    }
};

// IMPORTANTE: Exporte todas as funções que serão usadas nas rotas.
module.exports = {
    solicitarCorrida,
    buscarCorridasDisponiveis,
    aceitarCorrida
};