# Fase 6: telas da trilha, do módulo e da lição

PRs #6 e #7 (28/09/2026).

**O que foi feito**

- Telas da trilha, do módulo e da lição, com o renderizador de blocos de conteúdo.
- Cálculo de status de cada módulo (bloqueado, disponível, em andamento, concluído) a partir do
  progresso (`src/features/modules/engine/trail.ts`).
- Trava do botão de concluir a lição por um tempo mínimo de leitura.
- PR #7: correção de instabilidade no teste do tempo de leitura.

**Por quê**

A trava de leitura existe para ninguém concluir uma lição sem ler. O renderizador monta cada bloco
em componentes do React, nunca como HTML cru, para não abrir porta a injeção de script pelo
conteúdo.
