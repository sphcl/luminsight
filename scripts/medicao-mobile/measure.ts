/// <reference lib="dom" />
// Mede, num iPhone emulado de 390px, se alguma tela fica mais larga que a tela. Verificação manual, fora do CI.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { TEST_ACCOUNT } from './account'

const BASE = process.env.MEDICAO_URL ?? 'http://localhost:5173'
const VIEWPORT = { width: 390, height: 844 }
const FONTS = ['md', 'xl'] as const
const printsArg = process.argv.find((arg) => arg.startsWith('--prints='))?.slice('--prints='.length)

const PUBLIC_SCREENS: Array<[string, string]> = [
  ['landing', '/'],
  ['login', '/login'],
  ['cadastro', '/register'],
]

const SIGNED_IN_SCREENS: Array<[string, string]> = [
  ['dashboard', '/dashboard'],
  ['trilha', '/trilha'],
  ['modulo', '/modulos/modulo-02'],
  ['licao', '/modulos/modulo-02/licoes/licao-01'],
  ['simulacoes', '/simulacoes'],
  ['perfil', '/perfil'],
  ['quiz-final', '/quiz/modulo-05'],
]

const SIMULATIONS = ['simulacao-modulo-02', 'simulacao-modulo-03', 'simulacao-modulo-04']

interface Row {
  font: string
  screen: string
  viewport: number
  page: number
}

// A asserção do script inteiro: a página nunca pode ser mais larga que a tela.
async function measure(page: Page, font: string, screen: string, rows: Row[]): Promise<void> {
  // networkidle nunca chega: o Firestore mantém uma conexão de streaming aberta. Espero os esqueletos sumirem.
  await page.waitForLoadState('load')
  await page
    .waitForFunction(() => !document.querySelector('[aria-busy="true"]'), undefined, {
      timeout: 15000,
    })
    .catch(() => undefined)
  await page.waitForTimeout(600)
  const { viewport, width } = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    width: document.documentElement.scrollWidth,
  }))
  rows.push({ font, screen, viewport, page: width })
  if (printsArg) await page.screenshot({ path: join(printsArg, `${font}-${screen}.png`) })
}

async function clickByText(page: Page, text: string): Promise<void> {
  // Clique pelo DOM: com a página mais larga que a tela, o clique por coordenada pode cair noutro elemento.
  await page
    .getByRole('button', { name: text })
    .first()
    .evaluate((button) => (button as HTMLElement).click())
}

async function runFont(font: (typeof FONTS)[number], rows: Row[]): Promise<void> {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  await context.addInitScript((size) => {
    try {
      localStorage.setItem('luminsight:font-size', size)
    } catch {
      // Sem storage a medição segue na fonte padrão.
    }
  }, font)
  const page = await context.newPage()

  for (const [screen, path] of PUBLIC_SCREENS) {
    await page.goto(BASE + path)
    await measure(page, font, screen, rows)
  }

  await page.goto(`${BASE}/login`)
  await page.getByLabel('Email').fill(TEST_ACCOUNT.email)
  await page.getByLabel('Senha').fill(TEST_ACCOUNT.password)
  await clickByText(page, 'Entrar')
  await page.waitForURL(/dashboard/)

  for (const [screen, path] of SIGNED_IN_SCREENS) {
    await page.goto(BASE + path)
    await measure(page, font, screen, rows)
  }

  for (const simulationId of SIMULATIONS) {
    await page.goto(`${BASE}/simulacoes/${simulationId}`)
    await page.getByRole('button', { name: 'Começar simulação' }).waitFor()
    await measure(page, font, `${simulationId}-intro`, rows)
    await clickByText(page, 'Começar simulação')
    await page.waitForTimeout(3000)
    await measure(page, font, `${simulationId}-rodando`, rows)
  }

  await browser.close()
}

const rows: Row[] = []
if (printsArg) mkdirSync(printsArg, { recursive: true })
for (const font of FONTS) await runFont(font, rows)

const failures = rows.filter((row) => row.page !== row.viewport)
for (const row of rows) {
  const status = row.page === row.viewport ? 'ok' : 'ESTOURA'
  console.log(
    `${row.font.padEnd(3)} ${row.screen.padEnd(34)} página ${row.page}px  tela ${row.viewport}px  ${status}`
  )
}
console.log(
  failures.length === 0
    ? '\nNenhuma tela mais larga que 390px.'
    : `\n${failures.length} tela(s) estouram.`
)
process.exit(failures.length === 0 ? 0 : 1)
