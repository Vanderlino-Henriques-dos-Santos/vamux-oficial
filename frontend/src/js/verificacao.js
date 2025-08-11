// verificacao.js
// === BLOCO 1: IMPORTAÇÕES FIREBASE E VARIÁVEIS ===
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { app } from "./firebase-config.js";

// === BLOCO 2: INICIALIZAÇÃO ===
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

const form = document.getElementById("formVerificacao");
const status = document.getElementById("mensagemStatus");

// === BLOCO 3: VERIFICA USUÁRIO AUTENTICADO ===
let userId = null;
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
  } else {
    window.location.href = "login.html";
  }
});

// === BLOCO 4: ENVIO DE DOCUMENTOS ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const modelo = document.getElementById("modelo").value.trim();
  const placa = document.getElementById("placa").value.trim();
  const cnhFile = document.getElementById("cnh").files[0];
  const docFile = document.getElementById("documento").files[0];
  const compFile = document.getElementById("comprovante").files[0];

  if (!modelo || !placa || !cnhFile || !docFile || !compFile) {
    status.textContent = "Preencha todos os campos.";
    status.style.color = "red";
    return;
  }

  try {
    // Envia arquivos para o Storage
    const cnhPath = `documentos/${userId}/cnh.${cnhFile.name.split('.').pop()}`;
    const docPath = `documentos/${userId}/documento.${docFile.name.split('.').pop()}`;
    const compPath = `documentos/${userId}/comprovante.${compFile.name.split('.').pop()}`;

    await uploadBytes(storageRef(storage, cnhPath), cnhFile);
    await uploadBytes(storageRef(storage, docPath), docFile);
    await uploadBytes(storageRef(storage, compPath), compFile);

    // Atualiza dados no banco com flag de verificação pendente
    await update(ref(database, `motoristas/${userId}`), {
      modelo,
      placa,
      verificado: false,
      documentosEnviados: true
    });

    status.textContent = "Documentos enviados com sucesso! Aguardando aprovação.";
    status.style.color = "green";
    form.reset();
  } catch (error) {
    console.error("Erro ao enviar documentos:", error);
    status.textContent = "Erro ao enviar documentos. Tente novamente.";
    status.style.color = "red";
  }
});
