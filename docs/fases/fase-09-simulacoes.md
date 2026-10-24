# Fase 9: simulações interativas

PRs #10 (08/10/2026) e #11 (12/10/2026).

**O que foi feito**

- Motor das simulações (`src/features/simulations/engine/simulation.ts`): cenas, decisões, feedback e
  caminhos que dependem da escolha.
- Interfaces de e-mail, ligação e chat, imitando aplicativos reais com contatos fictícios.
- Aviso fixo de simulação no rodapé de todas as telas da simulação.

**Por quê**

Simular o golpe treina a reação sem risco, mas aumenta a chance de confusão com uma conversa real.
O aviso fixo foi uma decisão de segurança: ele fica na tela em qualquer rolagem, para ninguém tirar
um print sem ele. Nenhum nome, logotipo ou domínio real é usado, e os e-mails fictícios usam
domínios reservados (`.example`, `.invalid`), conferidos pela validação do conteúdo.
