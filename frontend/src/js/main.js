// frontend/src/js/main.js

// 1. IMPORTAÇÃO DE ESTILOS
// O caminho '../../' sobe dois níveis de pasta a partir de 'frontend/src/js'
// para chegar em 'frontend', e então entra na pasta 'css'.

// 2. IMPORTAÇÃO DE MÓDULOS DE PROJETO
// Este arquivo é para imports de estilos e outros módulos principais do JS que não são o ponto de entrada direto do HTML.
import './passageiro.js'; // Importa o módulo passageiro.js

// 3. IMPORTAÇÃO DA CONFIGURAÇÃO DO FIREBASE
// Importa os serviços do Firebase configurados.
import { app, auth, database, storage } from './firebase-config.js';

// 4. CÓDIGO DE INICIALIZAÇÃO
// Adicione aqui qualquer outro código JavaScript que seja parte do seu 'main',
// como lógica de inicialização de componentes, listeners de eventos, etc.
console.log("main.js carregado e Firebase importado.");

// Exemplo de como usar os serviços do Firebase (se for usado diretamente em main.js)
// if (auth) {
//   console.log("Firebase Auth está disponível em main.js para uso.");
// }