// src/teste.js
import { getDatabase, ref, set } from "firebase/database";
import { app } from "./firebase-config.js";

// Inicia o banco
const db = getDatabase(app);

// Referência pro botão
const botao = document.getElementById("btnTeste");

// Quando clicar no botão → grava no Firebase
if (botao) {
  botao.addEventListener("click", async () => {
    try {
      await set(ref(db, "testeVamux"), {
        mensagem: "🔥 Integração funcionando com sucesso!"
      });
      alert("✅ Mensagem enviada pro Firebase!");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("❌ Erro ao salvar no Firebase.");
    }
  });
}
