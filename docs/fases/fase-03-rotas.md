# Fase 3: rotas, guardas e layouts

PR #3 (02/09/2026).

**O que foi feito**

- Rotas da aplicação com carregamento sob demanda de cada tela (`src/lib/router/`).
- Três guardas: rota protegida (exige login e onboarding), rota de onboarding e rota só para
  visitantes (login e cadastro).
- Redirecionamento de volta para a página de origem depois do login, com validação do destino
  (`src/utils/security/redirect.ts`).
- Layouts com cabeçalho e menu lateral.

**Por quê**

Os guardas melhoram a experiência, mas não são a barreira de segurança: quem chama o banco direto
passa por eles. A validação do destino do redirecionamento impede o "open redirect", em que um link
do próprio site manda a pessoa para um domínio de golpe depois do login.
