import { choiceOptionClass } from '@/components/ui/choiceStyles'

interface ChoiceQuestionProps<T extends string> {
  name: string
  question: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
}

export function ChoiceQuestion<T extends string>({
  name,
  question,
  options,
  value,
  onChange,
}: ChoiceQuestionProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-3 font-semibold text-ink">{question}</legend>
      {options.map((option) => (
        <label key={option.value} className={choiceOptionClass}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="accent-accent"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
