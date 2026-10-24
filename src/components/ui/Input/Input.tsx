import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/helpers/classnames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    const describedBy = [error && errorId, hint && !error && hintId].filter(Boolean).join(' ')

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            // Contorno em border-control (3:1, WCAG 1.4.11): a régua decorativa some contra o fundo.
            'h-11 rounded-none border bg-surface px-3.5 text-base text-ink',
            'placeholder:text-ink-muted',
            'transition-colors duration-150 motion-reduce:transition-none',
            'disabled:cursor-not-allowed disabled:bg-surface-muted',
            error ? 'border-danger focus-visible:ring-danger' : 'border-control',
            className
          )}
          {...props}
        />

        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-sm text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
