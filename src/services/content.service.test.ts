import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDoc, getDocs, where } from 'firebase/firestore'
import type * as FirestoreModule from 'firebase/firestore'
import { getLessons, getModuleById, getModules } from './modules.service'
import { getSimulationById, getSimulations } from './simulations.service'
import { buildModule, buildLesson } from '@/test/fixtures/modules'
import { buildSimulation } from '@/test/fixtures/simulation'

vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof FirestoreModule>()
  return {
    ...actual,
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    query: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    where: vi.fn(() => ({})),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
  }
})

function docs(entries: [string, unknown][]) {
  return { docs: entries.map(([id, data]) => ({ id, data: () => data })) } as never
}

function single(id: string, data: unknown) {
  return { id, exists: () => data !== undefined, data: () => data } as never
}

const { id: _moduleId, ...validModule } = buildModule()
const { id: _lessonId, ...validLesson } = buildLesson()
const { id: _simulationId, ...validSimulation } = buildSimulation()

describe('leitura de conteúdo do Firestore', () => {
  beforeEach(() => {
    vi.mocked(where).mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('descarta módulo malformado em vez de quebrar a lista', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce(
      docs([
        ['modulo-01', validModule],
        ['modulo-x', { ...validModule, difficulty: 'impossivel' }],
      ])
    )

    expect((await getModules()).map((module) => module.id)).toEqual(['modulo-01'])
  })

  it('em produção só pede módulos ativos', async () => {
    vi.stubEnv('DEV', false)
    vi.mocked(getDocs).mockResolvedValueOnce(docs([]))

    await getModules()

    expect(where).toHaveBeenCalledWith('isActive', '==', true)
  })

  it('getModuleById devolve null para documento inexistente ou inválido', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce(single('modulo-01', undefined))
    expect(await getModuleById('modulo-01')).toBeNull()

    vi.mocked(getDoc).mockResolvedValueOnce(single('modulo-01', { title: 'só isso' }))
    expect(await getModuleById('modulo-01')).toBeNull()

    vi.mocked(getDoc).mockResolvedValueOnce(single('modulo-01', validModule))
    expect(await getModuleById('modulo-01')).toMatchObject({ id: 'modulo-01' })
  })

  it('descarta lição com bloco de vídeo sem https', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce(
      docs([
        ['licao-01', validLesson],
        [
          'licao-02',
          { ...validLesson, content: [{ type: 'video', url: 'javascript:alert(1)', title: 'x' }] },
        ],
      ])
    )

    expect((await getLessons('modulo-01')).map((lesson) => lesson.id)).toEqual(['licao-01'])
  })

  it('usa o id do documento e descarta simulação malformada', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce(
      docs([
        ['simulacao-modulo-02', { ...validSimulation, id: 'id-forjado' }],
        ['simulacao-modulo-03', { ...validSimulation, format: 'sms' }],
      ])
    )

    expect((await getSimulations()).map((simulation) => simulation.id)).toEqual([
      'simulacao-modulo-02',
    ])

    vi.mocked(getDoc).mockResolvedValueOnce(single('simulacao-modulo-02', undefined))
    expect(await getSimulationById('simulacao-modulo-02')).toBeNull()
  })
})
