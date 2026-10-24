# Fase 4: camada do Firestore e seed

PR #4 (14/09/2026).

**O que foi feito**

- Tipos de cada documento do banco (`src/types/`).
- Serviços que leem módulos, lições e simulações (`src/services/`).
- Validação com Zod de tudo que é lido do banco (`src/utils/security/firestore-validators.ts`).
- Script de seed com o Admin SDK (`scripts/seed-modules.ts`) e configuração TypeScript própria para
  os scripts.

**Por quê**

O conteúdo fica no banco para poder mudar sem novo deploy, mas só o seed escreve nele, com a
credencial de administrador fora do repositório. Validar o que vem do banco faz um documento fora do
formato ser descartado em vez de quebrar a interface.
