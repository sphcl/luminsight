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
        'rounded-card border border-surface-border bg-surface p-5 shadow-card',
        interactive &&
          'cursor-pointer transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}