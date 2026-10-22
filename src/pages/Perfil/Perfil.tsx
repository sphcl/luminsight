import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Badge, Button, Card, Input, Skeleton } from '@/components/ui'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { useAuth } from '@/hooks/useAuth'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'
import { useQuizHistory, type QuizHistoryEntry } from '@/features/profile/hooks/useQuizHistory'
import { updateProfileSchema } from '@/features/profile/schemas/profile.schema'
import { updateDisplayName } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { mapFirestoreError } from '@/utils/security/errors'
import type { UserDocument } from '@/types/user.types'

function formatCreatedAt(createdAt: UserDocument['createdAt'] | undefined): string {
  if (!(createdAt instanceof Timestamp)) return 'Indisponível'

  return createdAt.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function Perfil() {
  const { user, userDocument } = useAuth()
  const { logout, isLoading: isLoggingOut } = useAuthActions()
  const displayName = userDocument?.displayName ?? user?.displayName ?? 'Usuário'
  const photoURL = userDocument?.photoURL ?? user?.photoURL ?? null
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="page-title">Perfil</h1>
      </header>

      <Card className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="h-16 w-16 rounded-full object-cover"
              // Mesmo motivo do Header: não vazar a URL da página pro CDN do avatar.
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-rule font-serif text-3xl text-ink"
            >
              {initial}
            </span>
          )}
          <dl className="flex flex-col gap-1 text-sm">
            <div>
              <dt className="sr-only">Nome</dt>
              <dd className="text-lg font-semibold text-ink">{displayName}</dd>
            </div>
            <div>
              <dt className="sr-only">Email</dt>
              <dd className="text-ink-soft">
                {userDocument?.email || user?.email || 'Indisponível'}
              </dd>
            </div>
            <div className="flex gap-1 text-ink-muted">
              <dt>Conta criada em</dt>
              <dd>{formatCreatedAt(userDocument?.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <EditNameForm key={displayName} currentName={displayName} />
      </Card>

      <QuizHistorySection />

      <Button
        variant="secondary"
        className="self-start"
        isLoading={isLoggingOut}
        onClick={() => void logout()}
      >
        Sair da conta
      </Button>
    </div>
  )
}

function EditNameForm({ currentName }: { currentName: string }) {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const [name, setName] = useState(currentName)
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaved(false)
    setSaveError(null)
    const result = updateProfileSchema.safeParse({ displayName: name })
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message)
      return
    }

    setFieldError(undefined)
    setIsSaving(true)
    try {
      const savedName = await updateDisplayName(user.uid, result.data)
      if (userDocument) setUserDocument({ ...userDocument, displayName: savedName })
      setSaved(true)
    } catch (caughtError) {
      mapFirestoreError(caughtError)
      setSaveError('Não foi possível salvar o nome. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-3 border-t border-rule pt-6"
    >
      <Input
        label="Nome"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setSaved(false)
        }}
        error={fieldError}
      />
      {saveError && (
        <p role="alert" className="text-sm text-danger">
          {saveError}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-success">
          Nome atualizado.
        </p>
      )}
      <Button
        type="submit"
        className="self-start"
        isLoading={isSaving}
        disabled={name.trim() === currentName}
      >
        Salvar nome
      </Button>
    </form>
  )
}

function QuizHistorySection() {
  const { data, isLoading, error } = useQuizHistory()

  return (
    <section aria-labelledby="quiz-history-title" className="flex flex-col gap-3">
      <h2 id="quiz-history-title" className="text-lg font-semibold text-ink">
        Histórico de quizzes
      </h2>
      {error ? (
        <Card>
          <p className="text-sm text-ink-soft">{error}</p>
        </Card>
      ) : isLoading || !data ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Carregando histórico">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-14 w-full rounded-card" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">Você ainda não fez nenhum quiz.</p>
        </Card>
      ) : (
        <table className="w-full overflow-hidden rounded-card border border-rule bg-surface text-left text-sm">
          <thead className="bg-surface-muted text-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Módulo
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Melhor nota
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Tentativas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {data.map((entry) => (
              <QuizHistoryRow key={entry.moduleId} entry={entry} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function QuizHistoryRow({ entry }: { entry: QuizHistoryEntry }) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-ink">
        {entry.moduleOrder}. {entry.moduleTitle}
      </td>
      <td className="px-4 py-3">
        {entry.bestScore === null ? (
          <span className="text-ink-muted">Sem nota</span>
        ) : (
          <Badge variant={entry.bestScore >= QUIZ_PASSING_SCORE ? 'success' : 'warning'}>
            {entry.bestScore}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-ink-soft">{entry.attempts}</td>
    </tr>
  )
}
