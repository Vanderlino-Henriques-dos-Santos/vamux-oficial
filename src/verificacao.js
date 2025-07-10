// verificacao.js
// Este arquivo cuida do upload de documentos (CNH, Veículo, Comprovante de Residência) para o Firebase Storage
// e salva os nomes dos arquivos no Realtime Database, no nó verificacoes/UID/

import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase-config.js"; // ajuste o caminho conforme sua estrutura

const storage = getStorage(app);
const database = getDatabase(app);
const auth = getAuth(app);

// Inputs de arquivos no HTML
const cnhInput = document.getElementById("cnh");
const veiculoInput = document.getElementById("veiculo");
const comprovanteInput = document.getElementById("comprovante");

// Botão de envio
const btnEnviar = document.getElementById("btnEnviar");

// Mensagem de status
const mensagemStatus = document.getElementById("mensagem-status");

// Espera o usuário estar logado para pegar o UID
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;

    btnEnviar.addEventListener("click", async () => {
      // Verifica se os 3 arquivos foram selecionados
      if (!cnhInput.files[0] || !veiculoInput.files[0] || !comprovanteInput.files[0]) {
        mostrarMensagem("Todos os arquivos devem ser selecionados.", false);
        return;
      }

      try {
        // Cria as referências no Storage dentro da pasta do usuário
        const pastaUsuario = `verificacoes/${uid}/`;

        // Upload dos arquivos
        const cnhSnapshot = await uploadBytes(storageRef(storage, pastaUsuario + "cnh.jpg"), cnhInput.files[0]);
        const veiculoSnapshot = await uploadBytes(storageRef(storage, pastaUsuario + "veiculo.jpg"), veiculoInput.files[0]);
        const comprovanteSnapshot = await uploadBytes(storageRef(storage, pastaUsuario + "comprovante.jpg"), comprovanteInput.files[0]);

        // Salva no Realtime Database um status
        await set(dbRef(database, "verificacoes/" + uid), {
          status: "pendente",
          cnh: cnhSnapshot.metadata.fullPath,
          veiculo: veiculoSnapshot.metadata.fullPath,
          comprovante: comprovanteSnapshot.metadata.fullPath
        });

        mostrarMensagem("Documentos enviados com sucesso!", true);

        // Limpa os inputs após o envio
        cnhInput.value = "";
        veiculoInput.value = "";
        comprovanteInput.value = "";

      } catch (erro) {
        console.error("Erro ao enviar os documentos:", erro);
        mostrarMensagem("Erro ao enviar os documentos. Tente novamente.", false);
      }
    });

  } else {
    mostrarMensagem("Você precisa estar logado para enviar documentos.", false);
  }
});

// Função para exibir mensagens no HTML
function mostrarMensagem(texto, sucesso = true) {
  mensagemStatus.innerText = texto;
  mensagemStatus.style.color = sucesso ? "green" : "red";
}
