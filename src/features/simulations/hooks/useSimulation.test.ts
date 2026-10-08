import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSimulation } from './useSimulation'
import { buildSimulation } from '@/test/fixtures/simulation'
import { clearMatchMedia, mockReducedMotion } from '@/test/matchMedia'

const simulation = buildSimulation()

describe('useSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearMatchMedia()
  })

  it('mostra as mensagens aos poucos respeitando o delay de cada uma', () => {
    const { result } = renderHook(() => useSimulation(simulation))

    act(() => vi.advanceTimersByTime(0))
    expect(result.current.visibleMessages).toHaveLength(1)
    expect(result.current.areMessagesComplete).toBe(false)

    act(() => vi.advanceTimersByTime(999))
    expect(result.current.visibleMessages).toHaveLength(1)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.visibleMessages).toHaveLength(2)
    expect(result.current.areMessagesComplete).toBe(true)
  })

  it('mostra todas as mensagens de uma vez com prefers-reduced-motion', () => {
    mockReducedMotion(true)
    const { result } = renderHook(() => useSimulation(simulation))

    expect(result.current.visibleMessages).toHaveLength(2)
    expect(result.current.areMessagesComplete).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('não permite decidir antes de todas as mensagens aparecerem', () => {
    const { result } = renderHook(() => useSimulation(simulation))

    act(() => result.current.chooseOption('a'))

    expect(result.current.hasDecided).toBe(false)
  })

  it('não permite alterar a decisão confirmada', () => {
    mockReducedMotion(true)
    const { result } = renderHook(() => useSimulation(simulation))

    act(() => result.current.chooseOption('b'))
    act(() => result.current.chooseOption('a'))

    expect(result.current.selectedOption?.id).toBe('b')
    expect(result.current.feedback).toEqual({ isCorrect: false, feedback: 'Feedback B' })
    expect(result.current.decisions).toHaveLength(1)
  })

  it('ignora opção que não pertence à cena', () => {
    mockReducedMotion(true)
    const { result } = renderHook(() => useSimulation(simulation))

    act(() => result.current.chooseOption('z'))

    expect(result.current.hasDecided).toBe(false)
  })

  it('só avança depois de decidir e recomeça a revelação na cena nova', () => {
    const { result } = renderHook(() => useSimulation(simulation))

    act(() => result.current.goToNextScene())
    expect(result.current.sceneIndex).toBe(0)

    act(() => vi.advanceTimersByTime(0))
    act(() => vi.advanceTimersByTime(1000))
    act(() => result.current.chooseOption('a'))
    act(() => result.current.goToNextScene())

    expect(result.current.sceneIndex).toBe(1)
    expect(result.current.hasDecided).toBe(false)
    expect(result.current.visibleMessages).toHaveLength(0)
  })

  it('finaliza com o resumo e chama onFinish uma vez', () => {
    mockReducedMotion(true)
    const onFinish = vi.fn()
    const { result } = renderHook(() => useSimulation(simulation, { onFinish }))

    act(() => result.current.chooseOption('a'))
    act(() => result.current.goToNextScene())
    act(() => result.current.chooseOption('b'))
    act(() => {
      result.current.goToNextScene()
      result.current.goToNextScene()
    })

    expect(result.current.isFinished).toBe(true)
    expect(result.current.result).toMatchObject({
      correctDecisions: 1,
      totalDecisions: 2,
      score: 50,
      isPerfect: false,
    })
    expect(onFinish).toHaveBeenCalledOnce()
  })
})
