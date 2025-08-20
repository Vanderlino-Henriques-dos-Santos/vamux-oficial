// -----------------------------------------
// Firebase - Configuração do Projeto VAMUX
// -----------------------------------------
// Exportamos TUDO como "named exports" (inclui `app`) para
// usar:  import { app, auth, db, rtdb, storage } from "./firebase-config.js";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// -----------------------------------------
// Variáveis de ambiente (Vite)
// Garanta em frontend/.env:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_DATABASE_URL=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com   ← preferir .appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...
// -----------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o App Firebase (uma vez)
const app = initializeApp(firebaseConfig);

// Serviços que o VAMUX usa
const auth   = getAuth(app);       // Autenticação
const db     = getFirestore(app);  // Firestore
const rtdb   = getDatabase(app);   // Realtime Database
const storage= getStorage(app);    // Storage

// Exports nomeados (inclui `app`) — resolve o "No matching export ... for import 'app'"
export { app, auth, db, rtdb, storage };

// (Opcional) export default se você quiser importar como default em algum lugar
export default app;
