import type { ReactNode } from 'react'
import type { ContentBlock, HighlightVariant } from '@/types/module.types'
import { cn } from '@/utils/helpers/classnames'

interface ContentBlockRendererProps {
  block: ContentBlock
}

const highlightStyles: Record<
  HighlightVariant,
  { container: string; label: string; title: string }
> = {
  info: {
    container: 'border-primary-200 bg-primary-50 text-primary-900',
    label: 'text-primary-700',
    title: 'Para saber',
  },
  warning: {
    container: 'border-warning-200 bg-warning-50 text-slate-900',
    label: 'text-warning-700',
    title: 'Atenção',
  },
  danger: {
    container: 'border-danger-200 bg-danger-50 text-danger-900',
    label: 'text-danger-700',
    title: 'Cuidado',
  },
}

// Confiro de novo aqui porque o bloco pode chegar de fixture ou teste sem passar pelo parseLesson.
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

// O aviso de nova aba fica dentro do <a> pra entrar no nome acessível que o leitor de tela anuncia.
function ExternalLinkCard({
  url,
  label,
  title,
  detail,
}: {
  url: string
  label: string
  title: string
  detail?: string
}) {
  if (!isHttpsUrl(url)) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-1 rounded-card border border-surface-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-semibold text-primary-700">{title}</span>
      {detail && <span className="text-sm text-slate-600">{detail}</span>}
      <span className="text-xs text-slate-500">Abre em uma nova aba, fora do LumInsight.</span>
    </a>
  )
}

const BOLD_MARKER = '**'

// Conteúdo vem do Firestore: marcador sem par fica literal em vez de engolir o resto do parágrafo.
function renderBold(content: string): ReactNode[] {
  const parts = content.split(BOLD_MARKER)
  if (parts.length % 2 === 0) return [content]

  return parts.map((part, index) => {
    if (index % 2 === 0) return part
    // "****" sem nada no meio não vira <strong> vazio, volta pro texto como estava.
    return part === '' ? BOLD_MARKER + BOLD_MARKER : <strong key={index}>{part}</strong>
  })
}

// Renderizo tudo como texto via JSX porque o conteúdo vem do Firestore e não confio nele como HTML.
export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <p className="leading-relaxed text-slate-700">{renderBold(block.content)}</p>

    case 'heading':
      return <h2 className="pt-2 text-xl font-semibold text-slate-900">{block.content}</h2>

    case 'highlight': {
      const styles = highlightStyles[block.variant]
      return (
        <aside
          data-variant={block.variant}
          className={cn('rounded-card border-l-4 border p-4', styles.container)}
        >
          <p className={cn('text-xs font-semibold uppercase tracking-wide', styles.label)}>
            {styles.title}
          </p>
          <p className="mt-1 leading-relaxed">{block.content}</p>
        </aside>
      )
    }

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag
          className={cn(
            'space-y-1.5 pl-6 leading-relaxed text-slate-700',
            block.ordered ? 'list-decimal' : 'list-disc'
          )}
        >
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ListTag>
      )
    }

    case 'example':
      return (
        <section className="rounded-card border border-surface-border bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemplo</p>
          <h3 className="mt-1 font-semibold text-slate-900">{block.title}</h3>
          <p className="mt-2 leading-relaxed text-slate-700">{block.content}</p>
        </section>
      )

    case 'fact':
      return (
        <figure className="rounded-card border border-surface-border bg-surface p-4">
          <blockquote className="leading-relaxed text-slate-800">{block.content}</blockquote>
          <figcaption className="mt-2 text-sm text-slate-500">Fonte: {block.source}</figcaption>
        </figure>
      )

    case 'video':
      return (
        <ExternalLinkCard
          url={block.url}
          label="Vídeo externo"
          title={block.title}
          detail={block.caption}
        />
      )

    case 'link':
      return (
        <ExternalLinkCard
          url={block.url}
          label="Link externo"
          title={block.title}
          detail={block.description}
        />
      )

    default: {
      // Atribuo a never pra o type-check quebrar se entrar um type novo sem case aqui.
      const unknownBlock: never = block
      if (import.meta.env.DEV) {
        console.warn('[ContentBlockRenderer] bloco com type desconhecido ignorado', unknownBlock)
      }
      return null
    }
  }
}
