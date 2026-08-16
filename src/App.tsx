import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  ProgressBar,
  Skeleton,
  Toast,
} from '@/components/ui'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900">LumInsight</h1>
          <p className="text-sm text-slate-500">Design System — Fase 2</p>
        </header>

        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Botões</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Perigo</Button>
            <Button isLoading>Carregando</Button>
            <Button disabled>Desabilitado</Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Campos</h2>
          <div className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="voce@email.com" />
            <Input label="Senha" type="password" hint="Mínimo de 8 caracteres" />
            <Input label="Confirmação" error="As senhas não coincidem" />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutro</Badge>
            <Badge variant="primary">Iniciante</Badge>
            <Badge variant="success">Concluído</Badge>
            <Badge variant="warning">Em andamento</Badge>
            <Badge variant="danger">Bloqueado</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Progresso</h2>
          <ProgressBar value={65} label="Módulo 2" showPercentage />
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Skeleton</h2>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Sobreposições</h2>
          <div className="flex gap-3">
            <Button onClick={() => setIsModalOpen(true)}>Abrir modal</Button>
            <Button variant="secondary" onClick={() => setShowToast(true)}>
              Mostrar toast
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar ação"
      >
        <p className="mb-5 text-sm text-slate-600">
          Este modal fecha com a tecla Escape, clicando fora ou no botão abaixo.
        </p>
        <Button onClick={() => setIsModalOpen(false)} fullWidth>
          Entendi
        </Button>
      </Modal>

      <div className="pointer-events-none fixed right-4 top-4 z-50">
        <AnimatePresence>
          {showToast && (
            <Toast
              message="Componente funcionando corretamente"
              variant="success"
              onDismiss={() => setShowToast(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App