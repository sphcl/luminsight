// Único momento de comemoração da trilha: a régua de acento cresce uma vez, e fica parada com reduced motion.
export function ModuleCompleteNotice({ moduleTitle }: { moduleTitle: string }) {
  return (
    <div role="status" className="flex flex-col gap-3 motion-safe:animate-enter">
      <p className="eyebrow">Módulo concluído</p>
      <p className="font-serif text-3xl font-normal tracking-[-0.02em] text-ink">{moduleTitle}</p>
      <span
        aria-hidden="true"
        className="block h-0.5 w-full origin-left bg-accent motion-safe:animate-rule-grow"
      />
    </div>
  )
}
