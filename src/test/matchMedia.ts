import { vi } from 'vitest'

// jsdom não implementa matchMedia, então cada teste que depende de reduced motion instala o próprio.
export function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

export function clearMatchMedia() {
  Reflect.deleteProperty(window, 'matchMedia')
}
