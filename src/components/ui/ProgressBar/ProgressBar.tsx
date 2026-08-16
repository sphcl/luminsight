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
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showPercentage && (
            <span className="text-slate-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}