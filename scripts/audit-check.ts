// Roda npm audit e falha em qualquer advisory high/critical, menos os aceitos abaixo (ver docs/seguranca.md).
import { spawnSync } from 'node:child_process'

interface Advisory {
  url: string
  title: string
  severity: string
  name: string
}

interface AuditReport {
  vulnerabilities: Record<string, { via: (string | Advisory)[] }>
}

// Vazia de propósito: exceção que não suprime nada esconderia o aviso se ele voltasse (docs/seguranca.md, 6.1).
const ACCEPTED_ADVISORIES = new Map<string, string>()

const BLOCKING_SEVERITIES = new Set(['high', 'critical'])

const result = spawnSync('npm', ['audit', '--json'], { encoding: 'utf-8' })
if (!result.stdout) {
  console.error('npm audit não devolveu nada.', result.stderr)
  process.exit(1)
}

const report = JSON.parse(result.stdout) as AuditReport
const advisories = new Map<string, Advisory>()
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via) {
    if (typeof via !== 'string' && BLOCKING_SEVERITIES.has(via.severity)) {
      advisories.set(via.url, via)
    }
  }
}

const blocking = [...advisories.values()].filter(
  (advisory) => !ACCEPTED_ADVISORIES.has(advisory.url)
)
const accepted = [...advisories.values()].filter((advisory) =>
  ACCEPTED_ADVISORIES.has(advisory.url)
)

for (const advisory of accepted) {
  console.log(`aceito: ${advisory.name} ${advisory.url} (${ACCEPTED_ADVISORIES.get(advisory.url)})`)
}

if (blocking.length > 0) {
  for (const advisory of blocking) {
    console.error(`${advisory.severity}: ${advisory.name} ${advisory.title} ${advisory.url}`)
  }
  process.exit(1)
}

console.log('Nenhuma vulnerabilidade high ou critical fora das exceções aceitas.')
