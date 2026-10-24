import { FirebaseError } from 'firebase/app'

const GENERIC_CREDENTIALS_MESSAGE = 'Email ou senha incorretos.'
const GENERIC_FALLBACK_MESSAGE = 'Não foi possível concluir a ação. Tente novamente.'
const GENERIC_FIRESTORE_MESSAGE = 'Não foi possível carregar os dados. Tente novamente mais tarde.'

// Códigos que precisam retornar a MESMA mensagem: se o erro variasse entre
// "usuário não existe" e "senha errada", um atacante conseguiria enumerar
// quais emails têm conta cadastrada testando um por um
const CREDENTIAL_ERROR_CODES = new Set([
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/user-disabled',
])

const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este email já está cadastrado.',
  'auth/weak-password': 'A senha é muito fraca. Escolha uma senha mais forte.',
  'auth/invalid-email': 'Informe um email válido.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
  'auth/popup-closed-by-user': 'Login cancelado.',
  'auth/cancelled-popup-request': 'Login cancelado.',
  'auth/popup-blocked': 'O navegador bloqueou a janela de login. Permita pop-ups e tente de novo.',
}

// Traduz um erro do Firebase Auth para uma mensagem segura de exibir ao usuário.
// Nunca deixa o código interno do Firebase vazar pra interface.
export function mapAuthError(error: unknown): string {
  if (import.meta.env.DEV) {
    console.error('[auth]', error)
  }

  if (error instanceof FirebaseError) {
    if (CREDENTIAL_ERROR_CODES.has(error.code)) {
      return GENERIC_CREDENTIALS_MESSAGE
    }

    const knownMessage = KNOWN_ERROR_MESSAGES[error.code]
    if (knownMessage) {
      return knownMessage
    }
  }

  return GENERIC_FALLBACK_MESSAGE
}

// Traduz um erro do Firestore (permissão negada, offline, etc.) para uma
// mensagem segura de exibir ao usuário. O código real (ex.: "permission-denied",
// que pode indicar uma regra de segurança mal configurada) só vai pro console,
// e mesmo assim só em DEV — em produção não sobra rastro nenhum no console do
// navegador.
export function mapFirestoreError(error: unknown): string {
  if (import.meta.env.DEV) {
    console.error('[firestore]', error)
  }

  return GENERIC_FIRESTORE_MESSAGE
}
