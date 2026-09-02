import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

// Ícones inline (sem biblioteca externa): stroke-based, 24x24, herdam a cor
// do texto via currentColor. Decorativos por padrão — quem usa passa
// aria-hidden="true" já que sempre acompanham um rótulo de texto ao lado.
function createIconDefaults(props: IconProps): IconProps {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  }
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...createIconDefaults(props)}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...createIconDefaults(props)}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...createIconDefaults(props)}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

export function TrilhaIcon(props: IconProps) {
  return (
    <svg {...createIconDefaults(props)}>
      <path d="M4 19V5a2 2 0 0 1 2-2h11.5a.5.5 0 0 1 .5.5V17" />
      <path d="M4 19a2 2 0 0 0 2 2h13" />
    </svg>
  )
}

export function SimulacoesIcon(props: IconProps) {
  return (
    <svg {...createIconDefaults(props)}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  )
}

export function PerfilIcon(props: IconProps) {
  return (
    <svg {...createIconDefaults(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  )
}
