import { useEffect, useState } from 'react'

const TICK_MS = 1000

// Devolve quantos segundos faltam; quem usa remonta com key pra zerar o timer ao trocar de lição.
export function useReadingTimer(requiredSeconds: number): number {
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)

  // Calculo pela diferença de Date.now() porque o navegador atrasa setInterval em aba de fundo.
  const remaining = Math.max(0, Math.ceil(requiredSeconds - (now - startedAt) / 1000))
  const isDone = remaining === 0

  useEffect(() => {
    if (isDone) return

    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(intervalId)
  }, [isDone])

  return remaining
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
