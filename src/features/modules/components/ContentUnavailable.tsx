import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { primaryLinkClass } from '@/components/ui/linkStyles'
import { cn } from '@/utils/helpers/classnames'

interface ContentUnavailableProps {
  title: string
  description: string
  backTo: string
  backLabel: string
}

export function ContentUnavailable({
  title,
  description,
  backTo,
  backLabel,
}: ContentUnavailableProps) {
  return (
    <Card role="alert" className="mx-auto max-w-lg text-center">
      <h1 className="page-title">{title}</h1>
      <p className="mt-3 text-ink-soft">{description}</p>
      <Link to={backTo} className={cn(primaryLinkClass, 'mt-6')}>
        {backLabel}
      </Link>
    </Card>
  )
}
