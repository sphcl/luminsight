# Fase 14: coleta de dados para a pesquisa

PR #21, que também levou as fases 15 e 16 e esta documentação para o primeiro deploy de produção.

**O que foi feito**

- Aviso de pesquisa no onboarding, com declaração de 18 anos e aceite desmarcados por padrão, e
  aviso único para as contas criadas antes dele.
- Percepção de risco antes e depois, na escala de 4 pontos, com a marcação de quando o "antes" foi
  coletado.
- Gravação das decisões dentro das simulações (`simulationResults`) e da pesquisa final
  (`trailFeedback`), só para quem consentiu, conferido pelas rules.
- Revogação pelo Perfil, sem apagar nada, e registro no console das falhas de gravação da pesquisa.

**Por quê**

O capítulo de Resultados precisa de dado que não existia, e dado não coletado na hora não se
recupera. A coleta só com consentimento, travada nas rules, é minimização de dados (LGPD, art. 6º,
III). Os detalhes estão em `docs/modelagem.md` e em `docs/seguranca.md`, seção 10.
