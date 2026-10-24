import { cn } from '@/utils/helpers/classnames'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-card bg-surface-muted motion-safe:animate-pulse', className)}
    />
  )
}
