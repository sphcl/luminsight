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

    const describedBy = [error && errorId, hint && !error && hintId]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            'h-11 rounded-lg border bg-white px-3.5 text-sm text-slate-900',
            'placeholder:text-slate-400',
            'transition-colors duration-150',
            'disabled:bg-surface-muted disabled:cursor-not-allowed',
            error
              ? 'border-danger-500 focus-visible:ring-danger-500'
              : 'border-surface-border',
            className
          )}
          {...props}
        />

        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger-600">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-sm text-slate-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'