// Fallback compartilhado por: guards de rota (enquanto isInitializing) e
// Suspense das páginas com lazy loading. Um só componente, um só texto,
// em vez de reimplementar "Carregando..." em cada lugar que espera algo.
export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Carregando...</p>
    </div>
  )
}
