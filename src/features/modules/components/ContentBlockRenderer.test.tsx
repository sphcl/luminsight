import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContentBlockRenderer } from './ContentBlockRenderer'
import type { ContentBlock } from '@/types/module.types'

describe('ContentBlockRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza text como parágrafo', () => {
    render(<ContentBlockRenderer block={{ type: 'text', content: 'Um parágrafo' }} />)

    expect(screen.getByText('Um parágrafo').tagName).toBe('P')
  })

  it('renderiza heading como subtítulo', () => {
    render(<ContentBlockRenderer block={{ type: 'heading', content: 'Subtítulo' }} />)

    expect(screen.getByRole('heading', { name: 'Subtítulo' })).toBeInTheDocument()
  })

  it.each(['info', 'warning', 'danger'] as const)(
    'renderiza highlight com variant %s',
    (variant) => {
      const { container } = render(
        <ContentBlockRenderer block={{ type: 'highlight', variant, content: 'Destaque' }} />
      )

      expect(screen.getByText('Destaque')).toBeInTheDocument()
      expect(container.querySelector(`[data-variant="${variant}"]`)).not.toBeNull()
    }
  )

  it('renderiza list ordenada e não ordenada', () => {
    const { rerender } = render(
      <ContentBlockRenderer block={{ type: 'list', ordered: true, items: ['um', 'dois'] }} />
    )
    expect(screen.getByRole('list').tagName).toBe('OL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    rerender(<ContentBlockRenderer block={{ type: 'list', ordered: false, items: ['um'] }} />)
    expect(screen.getByRole('list').tagName).toBe('UL')
  })

  it('renderiza example com título e conteúdo', () => {
    render(
      <ContentBlockRenderer
        block={{ type: 'example', title: 'Título do exemplo', content: 'Corpo do exemplo' }}
      />
    )

    expect(screen.getByRole('heading', { name: 'Título do exemplo' })).toBeInTheDocument()
    expect(screen.getByText('Corpo do exemplo')).toBeInTheDocument()
  })

  it('renderiza fact com a fonte citada', () => {
    render(<ContentBlockRenderer block={{ type: 'fact', content: 'Um dado', source: 'IBGE' }} />)

    expect(screen.getByText('Um dado')).toBeInTheDocument()
    expect(screen.getByText('Fonte: IBGE')).toBeInTheDocument()
  })

  it('renderiza video como link externo que abre em nova aba sem opener', () => {
    render(
      <ContentBlockRenderer
        block={{
          type: 'video',
          url: 'https://www.youtube.com/watch?v=abc',
          title: 'Vídeo de exemplo',
          caption: 'Ative as legendas.',
        }}
      />
    )

    const link = screen.getByRole('link', { name: /Vídeo de exemplo/ })
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abc')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Ative as legendas.')).toBeInTheDocument()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('não renderiza video com url que não é https', () => {
    const { container } = render(
      <ContentBlockRenderer
        block={{ type: 'video', url: 'javascript:alert(1)', title: 'Malicioso' }}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza conteúdo com HTML como texto literal', () => {
    const { container } = render(
      <ContentBlockRenderer block={{ type: 'text', content: '<img src=x onerror="alert(1)">' }} />
    )

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument()
  })

  it('ignora type desconhecido sem quebrar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const unknownBlock = { type: 'audio', url: 'https://example.com' } as unknown as ContentBlock

    const { container } = render(<ContentBlockRenderer block={unknownBlock} />)

    expect(container).toBeEmptyDOMElement()
    expect(warn).toHaveBeenCalledOnce()
  })
})
