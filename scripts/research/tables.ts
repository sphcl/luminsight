import { randomInt } from 'node:crypto'
import { QUIZ_PASSING_SCORE } from '../../src/constants/quiz'
import type { Analysis } from './analyze'
import { formatDate, formatDateTime, type Cell } from './csv'

export interface Table {
  file: string
  header: string[]
  rows: Cell[][]
}

function usuarios({ participants }: Analysis): Table {
  return {
    file: 'usuarios.csv',
    header: [
      'participante',
      'criado_em',
      'concluiu_trilha',
      'onb_conhecimento',
      'onb_ja_caiu_em_golpe',
      'onb_motivacao',
      'risco_antes',
      'grupo_linha_de_base',
      'conhecimento_depois',
      'risco_depois',
      'satisfacao',
      'mais_util',
    ],
    // Só a data, sem hora: num grupo pequeno a hora exata de cadastro reconhece um colega.
    rows: participants.map(({ id, user, trailCompleted, baselineGroup, feedback }) => [
      id,
      formatDate(user.createdAt),
      trailCompleted,
      user.onboardingProfile?.securityKnowledge ?? null,
      user.onboardingProfile?.scamExperience ?? null,
      user.onboardingProfile?.motivation ?? null,
      user.riskBaseline?.riskPerception ?? null,
      baselineGroup,
      feedback?.securityKnowledge ?? null,
      feedback?.riskPerception ?? null,
      feedback?.satisfaction ?? null,
      feedback ? feedback.mostUseful.join('|') : null,
    ]),
  }
}

function progresso({ participants }: Analysis): Table {
  return {
    file: 'progresso.csv',
    header: [
      'participante',
      'modulo',
      'iniciado_em',
      'concluido_em',
      'licoes_concluidas',
      'melhor_nota_gravada',
      'tentativas_quiz_gravadas',
      'simulacao_concluida',
    ],
    rows: participants.flatMap(({ id, progress }) =>
      progress.map((entry) => [
        id,
        entry.moduleId,
        formatDateTime(entry.startedAt),
        formatDateTime(entry.completedAt),
        entry.lessonsCompleted,
        entry.quizBestScore,
        entry.quizAttempts,
        entry.simulationCompleted,
      ])
    ),
  }
}

function quiz({ quizAttempts }: Analysis): Table {
  return {
    file: 'quiz.csv',
    header: [
      'participante',
      'modulo',
      'tentativa',
      'nota',
      'acertos',
      'questoes',
      'tempo_segundos',
      'aprovado',
    ],
    rows: quizAttempts.map((attempt) => [
      attempt.participantId,
      attempt.moduleId,
      attempt.attempt,
      attempt.score,
      attempt.correct,
      attempt.total,
      attempt.timeSpentSeconds,
      attempt.score >= QUIZ_PASSING_SCORE,
    ]),
  }
}

function quizQuestoes({ quizAttempts }: Analysis): Table {
  return {
    file: 'quiz-questoes.csv',
    header: [
      'participante',
      'modulo',
      'tentativa',
      'questao',
      'alternativas_escolhidas',
      'acertou',
    ],
    rows: quizAttempts.flatMap((attempt) =>
      attempt.answers.map((answer) => [
        attempt.participantId,
        attempt.moduleId,
        attempt.attempt,
        answer.questionId,
        answer.selectedOptionIds.join('|'),
        answer.correct,
      ])
    ),
  }
}

function simulacoes({ simulationAttempts }: Analysis): Table {
  return {
    file: 'simulacoes.csv',
    header: [
      'participante',
      'simulacao',
      'modulo',
      'tentativa',
      'decisoes',
      'acertos',
      'tempo_segundos',
    ],
    rows: simulationAttempts.map((attempt) => [
      attempt.participantId,
      attempt.simulationId,
      attempt.moduleId,
      attempt.attempt,
      attempt.decisions.length,
      attempt.correct,
      attempt.timeSpentSeconds,
    ]),
  }
}

function simulacaoDecisoes({ simulationAttempts }: Analysis): Table {
  return {
    file: 'simulacao-decisoes.csv',
    header: ['participante', 'simulacao', 'tentativa', 'ordem', 'cena', 'opcao', 'acertou'],
    rows: simulationAttempts.flatMap((attempt) =>
      attempt.decisions.map((decision) => [
        attempt.participantId,
        attempt.simulationId,
        attempt.attempt,
        decision.order,
        decision.sceneId,
        decision.selectedOptionId,
        decision.correct,
      ])
    ),
  }
}

// Ordem por chave sorteada com crypto: a posição na planilha não pode denunciar de quem é cada comentário.
export function shuffle<T>(items: T[], pick: (max: number) => number = randomInt): T[] {
  return items
    .map((item) => ({ item, key: pick(2 ** 47) }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item)
}

// Sem identificador: um comentário que se identifica não pode arrastar junto o resto dos dados da pessoa.
function comentarios({ comments }: Analysis): Table {
  return {
    file: 'comentarios.csv',
    header: ['comentario'],
    rows: shuffle(comments).map((comment) => [comment]),
  }
}

export function buildTables(analysis: Analysis): Table[] {
  return [
    usuarios(analysis),
    progresso(analysis),
    quiz(analysis),
    quizQuestoes(analysis),
    simulacoes(analysis),
    simulacaoDecisoes(analysis),
    comentarios(analysis),
  ]
}
