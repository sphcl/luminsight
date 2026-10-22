// Só pra teste manual: marca módulos como concluídos pra uma conta, pulando as lições na mão.
// Faz de propósito o que o docs/seguranca.md (seção 4) descreve como limitação conhecida.
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { CONTENT_MODULES } from '../src/content'
import { initAdminApp } from './lib/admin-app'

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

async function main() {
  const email = readArg('email')
  const until = readArg('until') ?? 'modulo-04'
  const untilIndex = CONTENT_MODULES.findIndex((entry) => entry.id === until)

  if (!email || untilIndex === -1) {
    console.error(
      'Uso: npm run dev:complete-modules -- --email=voce@exemplo.com [--until=modulo-04]\n' +
        `Módulos válidos: ${CONTENT_MODULES.map((entry) => entry.id).join(', ')}`
    )
    process.exit(1)
  }

  const app = initAdminApp()
  const { uid } = await getAuth(app).getUserByEmail(email)
  const db = getFirestore(app)
  const modules = CONTENT_MODULES.slice(0, untilIndex + 1)

  for (const entry of modules) {
    // Mesmo formato que o app grava, com nota máxima e uma tentativa.
    await db.doc(`users/${uid}/progress/${entry.id}`).set({
      startedAt: FieldValue.serverTimestamp(),
      completedAt: FieldValue.serverTimestamp(),
      lessonsCompleted: entry.lessons.map((lesson) => lesson.id),
      quizBestScore: 100,
      quizAttempts: 1,
      simulationCompleted: entry.module.hasSimulation,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    })
    console.log(`  ${entry.id} marcado como concluído`)
  }

  console.log(`Pronto: ${modules.length} módulo(s) concluído(s) para ${email}.`)
}

main().catch((error) => {
  console.error('Falha ao marcar os módulos:', error)
  process.exit(1)
})
