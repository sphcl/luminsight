import { cn } from '@/utils/helpers/classnames'

interface ContactAvatarProps {
  name: string
  className?: string
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return initials || '?'
}

export function ContactAvatar({ name, className }: ContactAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700',
        className
      )}
    >
      {getInitials(name)}
    </span>
  )
}
