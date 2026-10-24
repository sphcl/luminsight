import type { ExportDataset, ExportUser } from './types'

export type ParticipationStatus =
  'incluido' | 'sem_decisao' | 'recusou' | 'revogou' | 'lista_exclusao'

export type BaselineGroup =
  'antes_do_uso' | 'depois_de_usar_sem_concluir' | 'depois_de_concluir' | 'sem_linha_de_base'

// Revogação é inferida: researchConsent guarda só a decisão atual. Recusa com dado de pesquisa gravado
// significa que a pessoa aceitou antes. Erra só quem aceitou e revogou sem gravar nada (docs/modelagem.md).
export function classifyParticipation(
  user: ExportUser,
  excluded: ReadonlySet<string>,
  hasResearchData: boolean
): ParticipationStatus {
  if (excluded.has(user.uid)) return 'lista_exclusao'
  if (!user.researchConsent) return 'sem_decisao'
  if (user.researchConsent.accepted) return 'incluido'
  return hasResearchData ? 'revogou' : 'recusou'
}

export function researchDataOwners(dataset: ExportDataset): Set<string> {
  return new Set([
    ...dataset.users.filter((user) => user.riskBaseline).map((user) => user.uid),
    ...dataset.simulationResults.map((result) => result.uid),
    ...dataset.feedback.map((entry) => entry.uid),
  ])
}

// A comparação usa a decisão atual: se a pessoa revogou e aceitou de novo, a data é a do novo aceite e o
// grupo pende pro lado contaminado, nunca pro válido.
export function classifyBaseline(user: ExportUser, trailCompletedAt: Date | null): BaselineGroup {
  if (!user.riskBaseline) return 'sem_linha_de_base'
  if (!user.riskBaseline.collectedAfterUse) return 'antes_do_uso'
  const decidedAt = user.researchConsent?.decidedAt ?? null
  if (trailCompletedAt && (!decidedAt || trailCompletedAt <= decidedAt)) return 'depois_de_concluir'
  return 'depois_de_usar_sem_concluir'
}
