import { initializeApp, getApps, getApp } from 'firebase/app'

// Só existe em npm run dev com VITE_USE_EMULATORS=true; no build de produção DEV é false e o trecho some.
export const usesEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'

const firebaseConfig = {
  // O emulador aceita qualquer chave: assim a medição roda num clone sem o .env do projeto.
  apiKey: usesEmulators ? 'demo-api-key' : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // Projeto demo-* o SDK só aceita contra emulador: nem um erro de configuração chega no banco real.
  projectId: usesEmulators ? 'demo-luminsight' : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Evita reinicializar o Firebase durante hot reload do Vite
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export { app }
