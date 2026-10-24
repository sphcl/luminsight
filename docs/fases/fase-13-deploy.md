# Fase 13: CI/CD, deploy e correções de uso

PRs #18 (22/10/2026), #19 e #20 (24/10/2026).

**O que foi feito**

- Pipeline: CI reaproveitado por pull requests e pelo deploy, prévia por pull request no canal
  `staging` e deploy de produção com aprovação manual.
- Contas de serviço com o mínimo de permissão e credencial de produção restrita ao environment de
  produção.
- Rules e índices publicados pelo pipeline, com o repositório como fonte única.
- Cache por tipo de arquivo no Hosting e divisão do código em pedaços que o navegador guarda entre
  versões.
- Correções vindas do uso: numeração das simulações alinhada ao módulo, mensagem de bloqueio que diz
  o que falta, links entre login e cadastro, Google no cadastro, site que estourava a largura do
  celular, aviso de simulação recolhível, piso de leitura de 20 segundos (`docs/usabilidade.md`).

**Por quê**

Publicar à mão não deixa registro e permite divergência entre o repositório e a produção. Os
detalhes de cada decisão estão em `docs/seguranca.md`, seção 9.
