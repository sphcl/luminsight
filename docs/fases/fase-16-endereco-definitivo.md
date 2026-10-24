# Fase 16: endereço definitivo e consentimento obrigatório

PR #21.

**O que foi feito**

- Site publicado em `https://luminsight-tcc.web.app`, um segundo site do Hosting no mesmo projeto.
- Endereço antigo redirecionando toda rota para o novo, com 302, pelo `firebase.json`.
- `consentRequired()` em `true`: o onboarding sem decisão sobre a pesquisa não é aceito.

**Por quê**

As três mudanças foram para produção no mesmo deploy da coleta e da exportação, que também foi o
primeiro deploy de produção do projeto. O redirecionamento evita uma cópia antiga do app no ar
gravando no mesmo banco, que quebraria em silêncio com as rules novas.
