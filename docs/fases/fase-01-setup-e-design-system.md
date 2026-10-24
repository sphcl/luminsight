# Fase 1: setup e design system

Commit `3766810` (25/07/2026) e PR #1 (15/08/2026).

**O que foi feito**

- Projeto criado com **Vite 8** (`"vite": "^8.1.1"` no `package.json` do commit `3766810`, o
  primeiro do repositório), React 19, TypeScript 6, Tailwind CSS 3, Firebase 12, Zustand, Zod,
  Vitest e ESLint com o plugin de segurança.
- Workflow de integração contínua (`.github/workflows/ci.yml`) desde o primeiro commit.
- Design system com os componentes base: botão, campo de texto, cartão, selo, barra de progresso,
  esqueleto de carregamento, modal e aviso flutuante (os dois últimos saíram na fase 12, sem uso).

**Por quê**

Componentes base num lugar só garantem o mesmo comportamento de foco, contraste e estados em todas
as telas. O lint de segurança (`eslint-plugin-security`) entrou desde o início para acusar padrões
perigosos, como acesso a objeto por chave vinda de fora.

**Correção de registro**

Um registro externo deste trabalho citava Vite 5 nesta fase. O repositório nunca usou o Vite 5: o
commit inicial já declara `^8.1.1`.
