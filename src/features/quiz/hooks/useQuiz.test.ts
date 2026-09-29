import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useQuiz } from './useQuiz'
import { buildQuestions } from '@/test/fixtures/quiz'

describe('useQuiz', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('não permite alterar a resposta depois de confirmada', () => {
    const { result } = renderHook(() => useQuiz(buildQuestions(2)))

    act(() => result.current.selectOption('b'))
    act(() => result.current.confirmAnswer())
    act(() => result.current.selectOption('a'))
    act(() => result.current.confirmAnswer())

    expect(result.current.selectedOptionId).toBe('b')
    expect(result.current.isCorrect).toBe(false)
  })

  it('não avança sem confirmar', () => {
    const { result } = renderHook(() => useQuiz(buildQuestions(2)))

    act(() => result.current.selectOption('a'))
    act(() => result.current.goToNext())

    expect(result.current.questionNumber).toBe(1)
    expect(result.current.hasAnswered).toBe(false)
  })

  it('não confirma sem alternativa selecionada', () => {
    const { result } = renderHook(() => useQuiz(buildQuestions(2)))

    act(() => result.current.confirmAnswer())

    expect(result.current.hasAnswered).toBe(false)
  })

  it('ignora alternativa que não pertence à questão', () => {
    const { result } = renderHook(() => useQuiz(buildQuestions(2)))

    act(() => result.current.selectOption('z'))

    expect(result.current.selectedOptionId).toBeNull()
  })

  it('avança depois de confirmar e limpa a seleção', () => {
    const { result } = renderHook(() => useQuiz(buildQuestions(2)))

    act(() => result.current.selectOption('a'))
    act(() => result.current.confirmAnswer())
    expect(result.current.isCorrect).toBe(true)

    act(() => result.current.goToNext())
    expect(result.current.questionNumber).toBe(2)
    expect(result.current.selectedOptionId).toBeNull()
    expect(result.current.hasAnswered).toBe(false)
  })

  it('finaliza com o resultado e o tempo do início ao fim, chamando onFinish uma vez', () => {
    vi.useFakeTimers()
    const onFinish = vi.fn()
    const { result } = renderHook(() => useQuiz(buildQuestions(2), { onFinish }))

    act(() => result.current.selectOption('a'))
    act(() => result.current.confirmAnswer())
    act(() => result.current.goToNext())
    act(() => result.current.selectOption('b'))
    act(() => result.current.confirmAnswer())
    vi.advanceTimersByTime(42_000)
    act(() => {
      result.current.goToNext()
      result.current.goToNext()
    })

    expect(result.current.isFinished).toBe(true)
    expect(result.current.result).toMatchObject({
      score: 50,
      correctAnswers: 1,
      totalQuestions: 2,
      timeSpentSeconds: 42,
      passed: false,
    })
    expect(onFinish).toHaveBeenCalledOnce()
  })
})
