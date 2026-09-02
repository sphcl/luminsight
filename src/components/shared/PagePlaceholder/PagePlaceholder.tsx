import { Badge, Card } from '@/components/ui'

interface PagePlaceholderProps {
  title: string
  description: string
  phase: string
}

// Casca mínima para as páginas ainda não implementadas (Fases 7-10): título,
// texto dizendo o que vai morar ali e em qual fase. Existe pra essas nove
// páginas não repetirem o mesmo <Card><h1>...</h1><p>...</p></Card>.
export function PagePlaceholder({ title, description, phase }: PagePlaceholderProps) {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Badge variant="primary" className="mt-4">
        {phase}
      </Badge>
    </Card>
  )
}
