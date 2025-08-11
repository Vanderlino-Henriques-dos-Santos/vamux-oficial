// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Define a pasta raiz do projeto, onde o Vite irá procurar pelos arquivos.
  // O ponto '.' indica que a raiz é o diretório atual.
  root: '.',

  // Configurações para o build, permitindo que o Vite processe múltiplos arquivos HTML.
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        cadastro: './cadastro.html',
        login: './login.html',
        passageiro: './passageiro.html',
        motorista: './motorista.html',
        verificacao: './verificacao.html', // Mantido para futuras implementações
        admin: './admin.html', // Mantido para futuras implementações
      }
    }
  },

  // Otimiza as dependências para carregar mais rápido durante o desenvolvimento.
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/database'
    ]
  }
});