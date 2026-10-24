# Fase 12: conteúdo, identidade visual e conversa

PRs #13 (segundo commit), #14, #15, #16 e #17 (18 a 22/10/2026).

**O que foi feito**

- Conteúdo final dos módulos 1 a 4 e o módulo 5, com o quiz final e o tipo de questão de múltiplas
  respostas, que só acerta com a seleção exata.
- Cobertura mínima de testes no CI (80% em segurança e motores, 60% no resto). Saíram o
  `framer-motion`, o modal e o aviso flutuante, que não eram usados.
- Identidade visual: tema claro e escuro, tamanho de fonte ajustável, ícones, imagem de
  compartilhamento e o `theme-init.js`, que aplica tema e fonte antes da primeira pintura.
- Simulações de chat e de ligação passaram a acumular a conversa na tela, com indicador de digitação
  e foco previsível para leitor de tela.

**Por quê**

O tamanho de fonte e o contraste medido atendem o público que mais sofre golpe, que inclui pessoas
idosas (`docs/seguranca.md`, seção 8). O `theme-init.js` é um arquivo e não um script embutido no
HTML para a CSP continuar sem `unsafe-inline`. A conversa acumulada torna a simulação mais próxima do
real sem abrir mão do aviso fixo.
