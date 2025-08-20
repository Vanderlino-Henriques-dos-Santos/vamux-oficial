// -----------------------------------------
// Listar Usuários (RTDB)
// -----------------------------------------
// Lê /usuarios e imprime em uma listagem simples na tela.

import { rtdb } from "./firebase-config.js";
import { ref, onValue } from "firebase/database";

const cont = document.getElementById("lista-usuarios");

onValue(ref(rtdb, "usuarios"), (snapshot) => {
  const usuarios = snapshot.val() || {};
  if (!cont) return;

  let html = `
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left border-b">
          <th class="py-2 pr-4">ID</th>
          <th class="py-2 pr-4">Nome</th>
          <th class="py-2 pr-4">Email</th>
          <th class="py-2 pr-4">Tipo</th>
          <th class="py-2 pr-4">Verificado</th>
        </tr>
      </thead>
      <tbody>
  `;

  const ids = Object.keys(usuarios);
  if (ids.length === 0) {
    cont.innerHTML = `<p class="text-gray-600">Nenhum usuário encontrado.</p>`;
    return;
  }

  for (const id of ids) {
    const u = usuarios[id] || {};
    html += `
      <tr class="border-b">
        <td class="py-2 pr-4">${id}</td>
        <td class="py-2 pr-4">${u.nome ?? "-"}</td>
        <td class="py-2 pr-4">${u.email ?? "-"}</td>
        <td class="py-2 pr-4">${u.tipo ?? "-"}</td>
        <td class="py-2 pr-4">${u.verificado ? "✅" : "❌"}</td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  cont.innerHTML = html;
});
