import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/helpers/classnames'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

// Canto reto e sem sombra. O acento fica só no primário, pra continuar significando ação principal.
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-on hover:bg-accent-hover active:bg-accent-hover',
  secondary:
    'border border-strong bg-transparent text-ink hover:bg-surface-muted active:bg-surface-muted',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-muted hover:text-ink',
  danger: 'bg-danger text-canvas hover:bg-danger/90 active:bg-danger/80',
}

// 44px é o mínimo de alvo de toque em todos os tamanhos; o sm só fica mais estreito e com letra menor.
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-none font-semibold',
          'transition-colors duration-150 motion-reduce:transition-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
          variantStyles[variant],
          // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
