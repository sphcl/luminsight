import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'

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
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Link
        to={backTo}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700"
      >
        {backLabel}
      </Link>
    </Card>
  )
}
