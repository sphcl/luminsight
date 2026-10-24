// Exporta os dados da pesquisa pra CSV. Só lê o banco; a única escrita é a dos CSV, fora do repositório.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { getFirestore } from 'firebase-admin/firestore'
import { z } from 'zod'
import { initAdminApp } from './lib/admin-app'
import { analyze } from './research/analyze'
import { toCsv, type CsvOptions } from './research/csv'
import { createPseudonymizer } from './research/pseudonym'
import { readDataset } from './research/read-firestore'
import { computeSummary, formatSummary } from './research/summary'
import { buildTables } from './research/tables'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const EXCLUSIONS_PATH = join(import.meta.dirname, 'research', 'excluded-accounts.json')
const KEY_PATH =
  process.env.LUMINSIGHT_EXPORT_KEY_PATH ?? join(homedir(), '.config', 'luminsight', 'export-key')

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

function stamp(): string {
  return new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', 'h')
}

function outputDir(): string {
  const dir = resolve(
    readArg('saida') ?? join(homedir(), 'Documents', 'luminsight-exportacoes', stamp())
  )
  // Dado de pesquisa nunca dentro do repositório, nem com gitignore.
  if (dir === REPO_ROOT || dir.startsWith(`${REPO_ROOT}${sep}`)) {
    throw new Error('A pasta de saída não pode ficar dentro do repositório.')
  }
  return dir
}

function csvOptions(): CsvOptions {
  const separator = readArg('separador') ?? ';'
  if (separator !== ';' && separator !== ',') throw new Error('--separador aceita só ";" ou ",".')
  return { separator, bom: !process.argv.includes('--sem-bom') }
}

function readKey(): string {
  if (!existsSync(KEY_PATH)) {
    throw new Error(
      `Chave da exportação não encontrada em ${KEY_PATH}. Gere uma vez com: openssl rand -hex 32 > ${KEY_PATH}`
    )
  }
  return readFileSync(KEY_PATH, 'utf8')
}

function readExclusions(): Set<string> {
  const parsed = z
    .object({ excludedUserIds: z.array(z.string().min(1)) })
    .strict()
    .parse(JSON.parse(readFileSync(EXCLUSIONS_PATH, 'utf8')))
  return new Set(parsed.excludedUserIds)
}

async function main(): Promise<void> {
  const options = csvOptions()
  const dir = outputDir()
  const pseudonymize = createPseudonymizer(readKey())
  const excluded = readExclusions()

  const dataset = await readDataset(getFirestore(initAdminApp()))
  const analysis = analyze(dataset, excluded, pseudonymize)

  mkdirSync(dir, { recursive: true })
  for (const table of buildTables(analysis)) {
    writeFileSync(join(dir, table.file), toCsv(table.header, table.rows, options))
  }

  console.log(formatSummary(analysis, computeSummary(analysis)))
  console.log(`\nArquivos em: ${dir}`)
}

main().catch((error: unknown) => {
  console.error('Exportação falhou:', error instanceof Error ? error.message : error)
  process.exit(1)
})
