// Popula módulos, lições e simulações no Firestore via Admin SDK, ver README para credencial.
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { CONTENT_MODULES, CONTENT_SIMULATIONS, type ContentModuleEntry } from '../src/content'
import { hasPendingText, validateContent } from '../src/content/validate'
import type { SimulationDocument } from '../src/types/simulation.types'
import { initAdminApp } from './lib/admin-app'

const isDryRun = process.argv.includes('--dry-run')

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

// Sem isso, renomear uma simulação em src/content deixa a antiga no banco e ela aparece duplicada na listagem.
async function removeStaleSimulations(db: Firestore): Promise<void> {
  const currentIds = new Set(CONTENT_SIMULATIONS.map((simulation) => simulation.id))
  const refs = await db.collection('simulations').listDocuments()

  for (const ref of refs) {
    if (currentIds.has(ref.id)) continue
    await ref.delete()
    console.log(`  simulação "${ref.id}" removida, não existe mais em src/content`)
  }
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

  const db = getFirestore(initAdminApp())

  console.log(
    `Populando Firestore com ${CONTENT_MODULES.length} módulo(s) e ${CONTENT_SIMULATIONS.length} simulação(ões)...`
  )
  for (const entry of CONTENT_MODULES) {
    await seedModule(db, entry)
  }
  for (const simulation of CONTENT_SIMULATIONS) {
    await seedSimulation(db, simulation)
  }
  await removeStaleSimulations(db)
  console.log('Seed concluído.')
}

main().catch((error) => {
  console.error('Falha ao popular o Firestore:', error)
  process.exit(1)
})
