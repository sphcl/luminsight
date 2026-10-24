import { Outlet } from 'react-router-dom'
import { Header } from '../Header/Header'

// Login, cadastro e onboarding: mesmo header do resto do site e o formulário centralizado embaixo.
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
