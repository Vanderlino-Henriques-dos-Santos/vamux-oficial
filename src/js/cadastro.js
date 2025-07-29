// === [BLOCO 1] IMPORTAÇÕES FIREBASE ===
// Importa os módulos do Firebase necessários
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "./firebase-config.js";

// === [BLOCO 2] INICIALIZAÇÕES ===
// Inicializa os serviços do Firebase
const auth = getAuth(app);
const database = getDatabase(app);

// Captura os elementos da página
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const tipoInputs = document.getElementsByName("tipo");
const btnCadastrar = document.getElementById("btn-cadastrar");
const mensagemStatus = document.getElementById("mensagemStatus"); // Corrigido para o ID correto
const veiculoInput = document.getElementById("veiculo");
const placaInput = document.getElementById("placa");

// === [BLOCO 3] EVENTO DE CADASTRO ===
btnCadastrar.addEventListener("click", async (e) => {
  e.preventDefault(); // Impede o reload da página

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value;
  const tipoSelecionado = Array.from(tipoInputs).find((input) => input.checked);
  const tipo = tipoSelecionado ? tipoSelecionado.value : "";

  if (!nome || !email || !senha || !tipo) {
    exibirMensagem("Preencha todos os campos!", false);
    return;
  }

  // Se for motorista, precisa preencher veículo e placa
  let veiculo = "";
  let placa = "";

  if (tipo === "motorista") {
    veiculo = veiculoInput.value.trim();
    placa = placaInput.value.trim();

    if (!veiculo || !placa) {
      exibirMensagem("Informe o modelo e a placa do veículo!", false);
      return;
    }
  }

  try {
    // Cria o usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const userId = userCredential.user.uid;

    // Cria objeto com os dados do usuário
    const dadosUsuario = {
      nome,
      email,
      tipo,
    };

    if (tipo === "motorista") {
      dadosUsuario.veiculo = veiculo;
      dadosUsuario.placa = placa;
    }

    // Salva os dados no Realtime Database
    await set(ref(database, `usuarios/${userId}`), dadosUsuario);

    exibirMensagem("Cadastro realizado com sucesso!", true);

    // Desloga o usuário após o cadastro
    await signOut(auth);

    // Redireciona para a página de login após 2 segundos
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

  } catch (erro) {
    console.error("Erro no cadastro:", erro.message);
    exibirMensagem("Erro ao cadastrar. Verifique os dados.", false);
  }
});

// === [BLOCO 4] EXIBIÇÃO DE MENSAGEM NA TELA ===
function exibirMensagem(texto, sucesso = true) {
  mensagemStatus.innerText = texto;
  mensagemStatus.style.color = sucesso ? "#28a745" : "#dc3545";
}
