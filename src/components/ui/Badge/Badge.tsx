import type { ReactNode } from 'react'
import { cn } from '@/utils/helpers/classnames'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

// Rótulo em caixa alta com fundo tonal; o texto sempre diz o estado, a cor só reforça.
const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'border border-rule bg-transparent text-ink-soft',
  primary: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        // Nunca quebra nem encolhe: em tela estreita quem cede espaço é o texto do lado.
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-sm px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.1em]',
        // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
