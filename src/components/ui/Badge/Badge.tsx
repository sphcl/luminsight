import type { ReactNode } from 'react'
import { cn } from '@/utils/helpers/classnames'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
}

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}