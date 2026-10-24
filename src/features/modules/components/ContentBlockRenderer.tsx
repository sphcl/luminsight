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
    container: 'bg-accent-soft text-ink',
    label: 'text-accent',
    title: 'Para saber',
  },
  warning: {
    container: 'bg-warning-soft text-ink',
    label: 'text-warning',
    title: 'Atenção',
  },
  danger: {
    container: 'bg-danger-soft text-ink',
    label: 'text-danger',
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
      className="group flex flex-col gap-1 rounded-card border border-rule bg-surface p-4 transition-colors hover:border-strong motion-reduce:transition-none"
    >
      <span className="eyebrow">{label}</span>
      <span className="text-[1.05em] font-semibold text-accent underline-offset-4 group-hover:underline">
        {title}
      </span>
      {detail && <span className="text-[0.9em] text-ink-soft">{detail}</span>}
      <span className="text-[0.8em] text-ink-muted">Abre em uma nova aba, fora do LumInsight.</span>
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
      return (
        <p className="text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink">
          {renderBold(block.content)}
        </p>
      )

    case 'heading':
      return (
        <h2 className="pt-4 font-serif text-[1.6em] font-normal leading-tight tracking-[-0.015em] text-ink">
          {block.content}
        </h2>
      )

    case 'highlight': {
      const styles = highlightStyles[block.variant]
      return (
        <aside data-variant={block.variant} className={cn('rounded-card p-5', styles.container)}>
          <p className={cn('text-[0.6875rem] font-medium uppercase tracking-[0.12em]', styles.label)}>
            {styles.title}
          </p>
          <p className="mt-2">{block.content}</p>
        </aside>
      )
    }

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag
          className={cn(
            'space-y-2 pl-6 text-ink-soft marker:text-ink-muted',
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
        <section className="border-t border-rule pt-4">
          <p className="eyebrow">Exemplo</p>
          <h3 className="mt-2 text-[1.1em] font-semibold text-ink">{block.title}</h3>
          <p className="mt-1 text-ink-soft">{block.content}</p>
        </section>
      )

    case 'fact':
      return (
        <figure className="border-y border-strong py-5">
          <blockquote className="font-serif text-[1.3em] leading-snug text-ink">
            {block.content}
          </blockquote>
          <figcaption className="mt-3 text-[0.85em] text-ink-muted">
            Fonte: {block.source}
          </figcaption>
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
