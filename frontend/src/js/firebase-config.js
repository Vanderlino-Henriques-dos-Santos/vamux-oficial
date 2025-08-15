// Arquivo: frontend/src/js/firebase-config.js

// Importando as funções e objetos necessários do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Suas chaves de API e configurações do Firebase
// IMPORTANTE: Mantenha estas variáveis no seu arquivo .env por segurança.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando os serviços do Firebase que vamos usar
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportando os serviços para que possam ser usados em outros arquivos
export { app, auth, db, storage };
