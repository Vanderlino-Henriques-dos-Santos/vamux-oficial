import { defineConfig } from 'vite'

export default defineConfig({
  root: 'frontend',
  server: { 
    port: 5174, // Porta alterada para 5174 para evitar o erro
    strictPort: true, 
    host: true, 
    open: '/index.html' 
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        cadastro: './cadastro.html',
        login: './login.html',
        passageiro: './passageiro.html',
        motorista: './motorista.html',
        verificacao: './verificacao.html',
        admin: './admin.html',
      }
    }
  },
  optimizeDeps: {
    include: ['firebase/app','firebase/auth','firebase/database']
  }
});