# Fase 8: motor do quiz

PR #9 (28/09/2026).

**O que foi feito**

- Motor de correção (`src/features/quiz/engine/scoring.ts`) e telas de pergunta, correção e
  resultado.
- Quizzes dos módulos em `src/content/quizzes/`, no código e não no banco.
- Gravação de cada tentativa em `quizResults` e da melhor nota no progresso.

**Por quê**

O gabarito fora do banco evita que alguém consulte as respostas pelo console. Ele continua visível
para quem inspeciona o código do site, limitação registrada em `docs/seguranca.md`, seção 4. A nota é
recalculada pelo gabarito em vez de confiar no "acertou" vindo da tela.
