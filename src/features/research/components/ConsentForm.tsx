import type { ConsentText } from '@/content/research'
import { cn } from '@/utils/helpers/classnames'

export interface ConsentChoice {
  isAdult: boolean
  accepted: boolean
}

interface ConsentFormProps {
  text: ConsentText
  value: ConsentChoice
  onChange: (value: ConsentChoice) => void
  headingLevel?: 'h1' | 'h2'
}

const checkboxClass =
  'flex min-h-11 cursor-pointer items-center gap-3 text-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:text-ink-muted'

// O aceite só destrava depois da declaração de 18 anos; desmarcar a declaração desmarca o aceite junto.
export function ConsentForm({ text, value, onChange, headingLevel = 'h1' }: ConsentFormProps) {
  const Heading = headingLevel

  return (
    <div className="flex flex-col gap-4">
      <Heading
        className={cn(headingLevel === 'h1' ? 'page-title' : 'text-lg font-semibold text-ink')}
      >
        {text.title}
      </Heading>
      <div className="flex flex-col gap-3 text-ink-soft">
        {text.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <fieldset className="flex flex-col gap-1 border-t border-rule pt-3">
        <legend className="sr-only">Participação na pesquisa</legend>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={value.isAdult}
            onChange={(event) =>
              onChange({
                isAdult: event.target.checked,
                accepted: event.target.checked && value.accepted,
              })
            }
            className="h-5 w-5 accent-accent"
          />
          Tenho 18 anos ou mais
        </label>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={value.accepted}
            disabled={!value.isAdult}
            onChange={(event) => onChange({ ...value, accepted: event.target.checked })}
            className="h-5 w-5 accent-accent"
          />
          Aceito participar da pesquisa
        </label>
      </fieldset>
    </div>
  )
}
