import { cn } from '@/utils/helpers/classnames'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="eyebrow">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium tabular-nums text-ink">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-0.5 w-full overflow-hidden bg-rule"
      >
        <div
          className="h-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
