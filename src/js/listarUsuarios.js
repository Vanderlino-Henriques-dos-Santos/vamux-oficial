// listarUsuarios.js - Lista todos os usuários do Firebase em uma tabela

// === BLOCO 01: IMPORTAÇÕES FIREBASE ===
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "./firebase-config.js";

// === BLOCO 02: REFERÊNCIAS INICIAIS ===
const database = getDatabase(app);
const usuariosBody = document.getElementById("usuariosBody");

// === BLOCO 03: FUNÇÃO PARA EXIBIR USUÁRIOS ===
function carregarUsuarios() {
  const usuariosRef = ref(database, "usuarios");

  onValue(usuariosRef, (snapshot) => {
    usuariosBody.innerHTML = ""; // Limpa a tabela

    if (snapshot.exists()) {
      snapshot.forEach((tipoSnapshot) => {
        const tipo = tipoSnapshot.key; // "passageiros" ou "motoristas"

        tipoSnapshot.forEach((usuarioSnapshot) => {
          const usuario = usuarioSnapshot.val();
          const linha = document.createElement("tr");

          linha.innerHTML = `
            <td>${tipo}</td>
            <td>${usuario.nome || "-"}</td>
            <td>${usuario.email || "-"}</td>
            <td>${usuario.modelo || "-"}</td>
            <td>${usuario.placa || "-"}</td>
          `;

          usuariosBody.appendChild(linha);
        });
      });
    } else {
      const linha = document.createElement("tr");
      linha.innerHTML = `<td colspan="5">Nenhum usuário encontrado.</td>`;
      usuariosBody.appendChild(linha);
    }
  });
}

// === BLOCO 04: INICIALIZA ===
carregarUsuarios();
