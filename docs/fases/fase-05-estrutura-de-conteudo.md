# Fase 5: estrutura do conteúdo

PR #5 (14/09/2026).

**O que foi feito**

- Estrutura dos cinco módulos, com lições, quizzes e simulações em `src/content/`.
- Marcador `[PENDENTE]` para texto ainda não escrito, e `src/content/validate.ts`, que impede
  publicar um módulo ativo com marcador pendente.

**Por quê**

Separar estrutura de redação deixou o código avançar enquanto o conteúdo era escrito, sem risco de
um texto provisório ir ao ar: o seed e os testes recusam conteúdo ativo com `[PENDENTE]`.
