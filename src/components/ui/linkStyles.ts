// Link que se comporta como botão (navegação) com o mesmo visual do Button, pra não copiar a string em cada tela.
export const primaryLinkClass =
  'inline-flex min-h-11 items-center justify-center bg-accent px-5 text-sm font-semibold text-accent-on transition-colors hover:bg-accent-hover motion-reduce:transition-none'

export const secondaryLinkClass =
  'inline-flex min-h-11 items-center justify-center border border-strong px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted motion-reduce:transition-none'

// Link de texto simples também precisa de 44px de altura pra quem toca com o dedo.
export const textLinkClass =
  'inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline'
