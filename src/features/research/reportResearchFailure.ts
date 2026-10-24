import { FirebaseError } from 'firebase/app'
import { ZodError } from 'zod'

export interface FailureDetails {
  tipo: 'recusa_do_banco' | 'validacao' | 'desconhecido'
  codigo: string
}

// Do Zod só levo caminho e código do erro: o valor digitado nunca vai pro console.
export function describeFailure(error: unknown): FailureDetails {
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => `${issue.path.join('.') || '(raiz)'}:${issue.code}`)
    return { tipo: 'validacao', codigo: issues.join(', ') }
  }
  if (error instanceof FirebaseError) return { tipo: 'recusa_do_banco', codigo: error.code }
  return { tipo: 'desconhecido', codigo: error instanceof Error ? error.name : typeof error }
}

// Vale também no build de produção, de propósito: quem usa vê uma frase só, e o console diz qual foi a falha.
export function reportResearchFailure(what: string, error: unknown): void {
  console.error(`[pesquisa] ${what} não gravado`, describeFailure(error))
}
