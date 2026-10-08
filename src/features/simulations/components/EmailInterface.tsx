import { Badge } from '@/components/ui'
import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import type {
  SimulationContact,
  SimulationDocument,
  SimulationMessage,
  SimulationScene,
} from '@/types/simulation.types'
import { cn } from '@/utils/helpers/classnames'
import { ContactAvatar } from './ContactAvatar'
import { SceneDecision } from './SceneDecision'
import { SimulationIndicator } from './SimulationIndicator'

interface EmailInterfaceProps {
  simulation: SimulationDocument
  session: UseSimulationReturn
}

const NO_SUBJECT = '(sem assunto)'

function getSubject(messages: SimulationMessage[]): string {
  return messages.find((message) => message.subject)?.subject ?? NO_SUBJECT
}

function attackerMessages(messages: SimulationMessage[]): SimulationMessage[] {
  return messages.filter((message) => message.sender === 'attacker')
}

// Cada cena é um email da caixa de entrada, e a decisão da cena é a classificação dele.
export function EmailInterface({ simulation, session }: EmailInterfaceProps) {
  const { contact } = simulation
  const { currentScene, sceneIndex, visibleMessages } = session

  const inbox = simulation.scenes.slice(0, sceneIndex + 1).flatMap((scene, index) => {
    const messages = index === sceneIndex ? visibleMessages : scene.messages
    return attackerMessages(messages).length > 0 ? [{ scene, messages }] : []
  })
  const context = visibleMessages.filter((message) => message.sender === 'system')
  const body = attackerMessages(visibleMessages)

  return (
    <>
      <section
        aria-label="Caixa de entrada simulada"
        className="grid overflow-hidden rounded-card border border-surface-border bg-white shadow-card md:grid-cols-[16rem_1fr]"
      >
        <div className="border-b border-surface-border bg-surface-muted md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2 border-b border-surface-border px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Caixa de entrada</h2>
            <Badge variant="warning">Fictícia</Badge>
          </div>
          <ul aria-label="Emails recebidos" className="flex flex-col">
            {inbox.map(({ scene, messages }) => (
              <InboxItem
                key={scene.id}
                scene={scene}
                messages={messages}
                contact={contact}
                isOpen={scene.id === currentScene?.id}
                classification={session.decisions.find((item) => item.sceneId === scene.id)}
              />
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {context.map((message, index) => (
            <p key={index} className="text-xs italic text-slate-500">
              {message.content}
            </p>
          ))}

          {body.length === 0 ? (
            <p aria-live="polite" className="text-sm text-slate-500">
              Recebendo email...
            </p>
          ) : (
            <article aria-live="polite" className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {getSubject(visibleMessages)}
              </h3>
              <div className="flex items-center gap-3">
                <ContactAvatar name={contact.name} />
                <dl className="min-w-0 text-sm">
                  <div className="flex gap-1">
                    <dt className="text-slate-500">De:</dt>
                    <dd className="break-all text-slate-900">
                      <span className="font-semibold">{contact.name}</span> &lt;{contact.address}
                      &gt;
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="text-slate-500">Para:</dt>
                    <dd className="text-slate-900">você</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-3 border-t border-surface-border pt-3 text-sm leading-relaxed text-slate-800">
                {body.map((message, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {message.content}
                  </p>
                ))}
              </div>
            </article>
          )}

          <div className="border-t border-surface-border pt-4">
            <SceneDecision session={session} variant="classify" />
          </div>
        </div>
      </section>
      <SimulationIndicator />
    </>
  )
}

interface InboxItemProps {
  scene: SimulationScene
  messages: SimulationMessage[]
  contact: SimulationContact
  isOpen: boolean
  classification: UseSimulationReturn['decisions'][number] | undefined
}

function InboxItem({ scene, messages, contact, isOpen, classification }: InboxItemProps) {
  const chosen = scene.decision.options.find(
    (option) => option.id === classification?.selectedOptionId
  )
  const preview = attackerMessages(messages)[0]?.content ?? ''

  return (
    <li
      aria-current={isOpen ? 'true' : undefined}
      className={cn(
        'flex flex-col gap-1 border-b border-surface-border px-4 py-3 text-sm',
        isOpen ? 'bg-white' : 'bg-transparent'
      )}
    >
      <span className="truncate font-semibold text-slate-900">{contact.name}</span>
      <span className="truncate text-xs text-slate-500">{contact.address}</span>
      <span className="truncate text-slate-800">{getSubject(messages)}</span>
      <span className="truncate text-xs text-slate-500">{preview}</span>
      {chosen && classification && (
        <Badge variant={classification.isCorrect ? 'success' : 'danger'} className="self-start">
          {chosen.text}
        </Badge>
      )}
    </li>
  )
}
