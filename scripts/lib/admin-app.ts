// Credencial e app do Admin SDK compartilhados pelos scripts; ver README, seção "Seed do Firestore".
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { cert, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app'

// Fora do repositório é o lugar recomendado: assim a chave nunca entra num git add por engano.
const HOME_SERVICE_ACCOUNT_PATH = join(homedir(), '.config', 'luminsight', 'service-account.json')
const REPO_SERVICE_ACCOUNT_PATH = './firebase-service-account.json'

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  (existsSync(HOME_SERVICE_ACCOUNT_PATH) ? HOME_SERVICE_ACCOUNT_PATH : REPO_SERVICE_ACCOUNT_PATH)

function loadServiceAccount(): ServiceAccount {
  let raw: string
  try {
    raw = readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
  } catch {
    console.error(
      `Não encontrei o arquivo de credenciais em "${SERVICE_ACCOUNT_PATH}".\n` +
        'Veja no README (seção "Seed do Firestore") como gerar e onde salvar esse arquivo.\n' +
        'Dica: use a variável de ambiente FIREBASE_SERVICE_ACCOUNT_PATH para apontar para outro caminho.'
    )
    process.exit(1)
  }

  return JSON.parse(raw) as ServiceAccount
}

export function initAdminApp(): App {
  return initializeApp({ credential: cert(loadServiceAccount()) })
}
