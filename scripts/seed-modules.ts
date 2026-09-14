// Script de seed: popula o Firestore com os módulos e lições definidos em
// src/content/. Roda com o Firebase Admin SDK (nunca com o SDK client), que
// ignora firestore.rules, é assim que dá pra escrever em "modules" e
// "lessons", que as regras publicadas bloqueiam para qualquer client comum.
//
// Precisa de uma credencial de admin (arquivo de conta de serviço). Veja no
// README, seção "Seed do Firestore", como gerar esse arquivo no Console do
// Firebase e onde salvá-lo. Ele NUNCA vai para o repositório (está no
// .gitignore).
import { readFileSync } from 'node:fs'
import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import {
  MODULE_04_ID,
  module04,
  module04Lessons,
  type Module04LessonEntry,
} from '../src/content/modules/module-04'
import type { ModuleDocument } from '../src/types/module.types'

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './firebase-service-account.json'

interface ModuleSeed {
  id: string
  data: ModuleDocument
  lessons: Module04LessonEntry[]
}

const MODULES_TO_SEED: ModuleSeed[] = [{ id: MODULE_04_ID, data: module04, lessons: module04Lessons }]

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

// Trava o seed de um módulo com conteúdo ainda não preenchido (título vazio
// é o placeholder deixado em src/content/ enquanto o texto real não chega).
// Melhor falhar alto e claro aqui do que publicar um módulo vazio na trilha.
function assertContentIsFilled(entry: ModuleSeed): void {
  if (!entry.data.title) {
    throw new Error(
      `Módulo "${entry.id}" ainda não tem conteúdo preenchido (title vazio), não seedando.`
    )
  }

  const emptyLesson = entry.lessons.find((lesson) => !lesson.data.title)
  if (emptyLesson) {
    throw new Error(
      `Lição "${emptyLesson.id}" do módulo "${entry.id}" ainda não tem conteúdo preenchido, não seedando.`
    )
  }
}

async function seedModule(db: FirebaseFirestore.Firestore, entry: ModuleSeed): Promise<void> {
  assertContentIsFilled(entry)

  const moduleRef = db.collection('modules').doc(entry.id)
  await moduleRef.set(entry.data)
  console.log(`  módulo "${entry.id}" gravado`)

  for (const lesson of entry.lessons) {
    await moduleRef.collection('lessons').doc(lesson.id).set(lesson.data)
    console.log(`    lição "${lesson.id}" gravada`)
  }
}

async function main(): Promise<void> {
  const serviceAccount = loadServiceAccount()
  initializeApp({ credential: cert(serviceAccount) })
  const db = getFirestore()

  console.log(`Populando Firestore com ${MODULES_TO_SEED.length} módulo(s)...`)
  for (const entry of MODULES_TO_SEED) {
    await seedModule(db, entry)
  }
  console.log('Seed concluído.')
}

main().catch((error) => {
  console.error('Falha ao popular o Firestore:', error)
  process.exit(1)
})
