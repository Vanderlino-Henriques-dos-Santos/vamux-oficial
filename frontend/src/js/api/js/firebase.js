// Arquivo: frontend/src/js/firebase-config.js

// 1. Importa as funções necessárias do Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 2. Objeto de configuração do seu projeto Firebase
//    ✅ VOCÊ DEVE SUBSTITUIR ESTES VALORES PELOS SEUS
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// 3. Inicializa o aplicativo Firebase com a sua configuração
const app = initializeApp(firebaseConfig);

// 4. Obtém instâncias dos serviços que vamos usar
//    - `auth`: Serviço de Autenticação do Firebase
//    - `db`: Serviço de Banco de Dados (Firestore)
const auth = getAuth(app);
const db = getFirestore(app);

// 5. Exporta as instâncias para que outros arquivos possam usá-las
export { auth, db };