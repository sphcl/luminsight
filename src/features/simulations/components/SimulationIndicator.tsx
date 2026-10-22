// Fixed e não sticky pra nenhum scroll, de página ou de container, conseguir tirar o aviso da tela.
export function SimulationIndicator() {
  return (
    <div
      role="note"
      aria-label="Aviso de simulação"
      // Cores fixas de propósito: a faixa tem que ser igual e inequívoca em qualquer tema (contraste em docs/seguranca.md).
      className="fixed inset-x-0 bottom-0 z-40 flex min-h-12 items-center justify-center gap-2 border-t-2 border-amber-600 bg-amber-100 px-4 py-2 text-center text-sm text-slate-900"
    >
      <span className="bg-amber-800 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">
        Simulação
      </span>
      <span>
        Treino do LumInsight com contatos e mensagens fictícios. Nada aqui é uma comunicação real.
      </span>
    </div>
  )
}
