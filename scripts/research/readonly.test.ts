import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const RESEARCH_DIR = import.meta.dirname
const ENTRY = join(RESEARCH_DIR, '..', 'export-results.ts')
const FIRESTORE_FILES = [join(RESEARCH_DIR, 'read-firestore.ts'), ENTRY]

// Qualquer método que escreve no Firestore ou mexe em conta no Auth.
const WRITE_CALLS =
  /\.(set|update|add|delete|create|commit|batch|runTransaction|bulkWriter|recursiveDelete|deleteUser|deleteUsers|updateUser|createUser|setCustomUserClaims)\(/

const pureModules = readdirSync(RESEARCH_DIR)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
  .filter((file) => file !== 'read-firestore.ts')
  .map((file) => join(RESEARCH_DIR, file))

describe('exportação só lê o banco', () => {
  it.each(FIRESTORE_FILES)('%s não chama nenhum método de escrita', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(WRITE_CALLS)
  })

  it('o Auth do Admin SDK nem é importado', () => {
    for (const file of FIRESTORE_FILES) {
      expect(readFileSync(file, 'utf8')).not.toMatch(/firebase-admin\/auth/)
    }
  })

  it('o resto da exportação é cálculo puro, sem Admin SDK', () => {
    expect(pureModules.length).toBeGreaterThan(4)
    for (const file of pureModules) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/firebase-admin/)
    }
  })
})
