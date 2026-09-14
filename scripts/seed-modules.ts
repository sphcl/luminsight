// Popula módulos, lições e simulações no Firestore via Admin SDK, ver README para credencial.
import { readFileSync } from 'node:fs'
import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { CONTENT_MODULES, CONTENT_SIMULATIONS, type ContentModuleEntry } from '../src/content'
import { hasPendingText, validateContent } from '../src/content/validate'
import type { SimulationDocument } from '../src/types/simulation.types'

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './firebase-service-account.json'

const isDryRun = process.argv.includes('--dry-run')

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

function moduleHasPendingContent(entry: ContentModuleEntry): boolean {
  return (
    hasPendingText(entry.module) ||
    entry.lessons.some((lesson) => hasPendingText(lesson.data)) ||
    entry.quiz.some(hasPendingText)
  )
}

function warnAboutPendingContent(): void {
  for (const entry of CONTENT_MODULES) {
    if (moduleHasPendingContent(entry)) {
      console.warn(`aviso: módulo "${entry.id}" ainda tem conteúdo com [PENDENTE]`)
    }
  }

  for (const simulation of CONTENT_SIMULATIONS) {
    if (hasPendingText(simulation)) {
      console.warn(`aviso: simulação "${simulation.id}" ainda tem conteúdo com [PENDENTE]`)
    }
  }
}

async function seedModule(db: Firestore, entry: ContentModuleEntry): Promise<void> {
  const moduleRef = db.collection('modules').doc(entry.id)
  await moduleRef.set(entry.module)
  console.log(`  módulo "${entry.id}" gravado`)

  for (const lesson of entry.lessons) {
    await moduleRef.collection('lessons').doc(lesson.id).set(lesson.data)
    console.log(`    lição "${lesson.id}" gravada`)
  }
}

async function seedSimulation(db: Firestore, simulation: SimulationDocument): Promise<void> {
  await db.collection('simulations').doc(simulation.id).set(simulation)
  console.log(`  simulação "${simulation.id}" gravada`)
}

async function main(): Promise<void> {
  const errors = validateContent(CONTENT_MODULES, CONTENT_SIMULATIONS)
  if (errors.length > 0) {
    console.error('Conteúdo inválido, seed abortado:')
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }

  warnAboutPendingContent()

  if (isDryRun) {
    console.log(
      `Dry-run: seedaria ${CONTENT_MODULES.length} módulo(s) e ${CONTENT_SIMULATIONS.length} simulação(ões), nenhuma escrita foi feita.`
    )
    return
  }

  const serviceAccount = loadServiceAccount()
  initializeApp({ credential: cert(serviceAccount) })
  const db = getFirestore()

  console.log(
    `Populando Firestore com ${CONTENT_MODULES.length} módulo(s) e ${CONTENT_SIMULATIONS.length} simulação(ões)...`
  )
  for (const entry of CONTENT_MODULES) {
    await seedModule(db, entry)
  }
  for (const simulation of CONTENT_SIMULATIONS) {
    await seedSimulation(db, simulation)
  }
  console.log('Seed concluído.')
}

main().catch((error) => {
  console.error('Falha ao popular o Firestore:', error)
  process.exit(1)
})
