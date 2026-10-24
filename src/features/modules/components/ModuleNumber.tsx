import { cn } from '@/utils/helpers/classnames'

interface ModuleNumberProps {
  order: number
  className?: string
}

// Número pendurado na margem, fora do fluxo do texto: é a assinatura da listagem. Decorativo, quem usa põe o número no nome acessível.
export function ModuleNumber({ order, className }: ModuleNumberProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block font-serif text-5xl font-normal leading-none tracking-[-0.03em] text-ink-muted tabular-nums',
        // Quem usa reserva a margem com md:pl-20 no item; o número fica nela, fora do fluxo do texto.
        'md:absolute md:left-0 md:w-14 md:text-right',
        className
      )}
    >
      {String(order).padStart(2, '0')}
    </span>
  )
}
