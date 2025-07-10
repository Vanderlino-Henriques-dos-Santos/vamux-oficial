// vite.config.js
// Configuração para múltiplas páginas e compatível com Firebase modular + .env

import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Define a raiz do projeto
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        cadastro: './cadastro.html',
        login: './login.html',
        passageiro: './passageiro.html',
        motorista: './motorista.html',
        verificacao: './verificacao.html', // se tiver
        admin: './admin.html',             // se usar
      }
    }
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/database'
    ]
  }
});
