import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/helpers/classnames'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  children: ReactNode
}

export function Card({ interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // Régua de 1px no lugar de sombra; o card interativo só escurece a régua no hover.
        'rounded-card border border-rule bg-surface p-5',
        interactive &&
          'cursor-pointer transition-colors duration-150 hover:border-strong motion-reduce:transition-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
