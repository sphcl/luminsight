import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { RouteError } from './RouteError'

function Boom(): never {
  throw new Error('FirebaseError: permission-denied em users/uid-secreto')
}

describe('RouteError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra mensagem genérica sem vazar o erro interno', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const router = createMemoryRouter([
      { path: '/', element: <Boom />, errorElement: <RouteError /> },
    ])

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Ocorreu um erro inesperado.')).toBeInTheDocument()
    expect(screen.queryByText(/permission-denied|uid-secreto/)).not.toBeInTheDocument()
  })

  it('usa o status da rota quando o erro é uma resposta de rota', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        loader: () => {
          throw new Response(null, { status: 404, statusText: 'Not Found' })
        },
        element: <p>nunca</p>,
        errorElement: <RouteError />,
      },
    ])

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Not Found')).toBeInTheDocument()
  })
})
