// === auth-guard.js - Guarda de Autenticação VAMUX (Atualizado em 10/07/2025) ===
// Este arquivo contém funções para:
// - Proteger rotas, redirecionando usuários não autenticados ou com tipo de conta incorreto.
// - Obter o UID do usuário atualmente logado.
// - Gerenciar o processo de logout.

// ✅ Bloco 1: Importações Firebase
import { auth, database } from "./firebase-config.js"; // Importa 'auth' e 'database' do firebase-config
import { onAuthStateChanged, signOut } from "firebase/auth"; // Funções de autenticação
import { ref, get } from "firebase/database"; // Funções de banco de dados

// ✅ Bloco 2: Função para proteger rotas
// Redireciona o usuário se ele não estiver autenticado ou não tiver o tipo de conta correto.
export function protectRoute(expectedUserType) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuário está logado, agora verifica o tipo de conta
      const userId = user.uid;
      const userTypeRef = ref(database, `usuarios/${userId}/tipo`);
      
      try {
        const snapshot = await get(userTypeRef);
        const userType = snapshot.val(); // Obtém o tipo de usuário do banco de dados

        if (userType === expectedUserType) {
          console.log(`✅ Usuário ${userId} (${userType}) autenticado e autorizado para esta rota.`);
          // Permanece na página
        } else {
          console.warn(`⚠️ Usuário ${userId} (${userType}) não autorizado para esta rota. Redirecionando...`);
          // Redireciona para a página apropriada ou para o login
          if (userType === "passageiro") {
            window.location.href = "passageiro.html";
          } else if (userType === "motorista") {
            window.location.href = "motorista.html";
          } else {
            // Tipo de usuário desconhecido ou não esperado, redireciona para o login
            window.location.href = "login.html";
          }
        }
      } catch (error) {
        console.error("❌ Erro ao verificar tipo de usuário no banco de dados:", error);
        // Em caso de erro, redireciona para o login por segurança
        window.location.href = "login.html";
      }
    } else {
      // Usuário não está logado, redireciona para a página de login
      console.warn("⚠️ Usuário não autenticado. Redirecionando para login.html...");
      window.location.href = "login.html";
    }
  });
}

// ✅ Bloco 3: Função para obter o UID do usuário atual
// Retorna uma Promise que resolve com o UID do usuário logado.
export function getCurrentUserId() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Desinscreve o listener após a primeira execução
      if (user) {
        resolve(user.uid);
      } else {
        reject("Nenhum usuário logado.");
      }
    });
  });
}

// ✅ Bloco 4: Função para realizar o logout
// Desconecta o usuário e o redireciona para a página de login.
export async function logout() {
  try {
    await signOut(auth);
    console.log("✅ Usuário desconectado com sucesso.");
    window.location.href = "login.html"; // Redireciona para a página de login
  } catch (error) {
    console.error("❌ Erro ao fazer logout:", error);
    alert("Erro ao fazer logout. Tente novamente."); // Usar modal personalizado em produção
  }
}
