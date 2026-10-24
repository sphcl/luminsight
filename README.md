# LumInsight

Trilha gratuita sobre engenharia social, phishing e golpes com inteligência artificial, com lições
curtas, quizzes e simulações para treinar sem risco. O LumInsight é o Trabalho de Conclusão de Curso
de um grupo de Segurança da Informação.

**Site:** https://luminsight-tcc.web.app

## O que o site faz

A pessoa cria uma conta, responde três perguntas sobre o próprio ponto de partida e percorre cinco
módulos em sequência. Cada módulo tem lições curtas com tempo mínimo de leitura e um quiz; os
módulos 2, 3 e 4 têm também uma simulação de golpe, por e-mail, ligação ou chat, com contatos
fictícios e um aviso fixo de simulação na tela. O site tem tema claro e escuro, tamanho de fonte
ajustável e foi medido para funcionar em celulares de 390 px de largura.

Quem aceita participar da pesquisa do TCC tem o progresso, as respostas e as decisões nas simulações
usados de forma agregada e anônima no capítulo de Resultados. Participar é opcional e só vale para
quem tem 18 anos ou mais; quem não participa usa o site inteiro do mesmo jeito.

## Stack

| Tecnologia | Para quê |
| --- | --- |
| React 19 e TypeScript 6 | interface e linguagem |
| Vite 8 | build e servidor de desenvolvimento |
| React Router 7 | navegação e guardas de rota |
| Firebase 12 (Authentication, Firestore e Hosting) | login, banco de dados e hospedagem, sem servidor próprio |
| Zod 4 | validação de entrada e de tudo que é lido do banco |
| Zustand 5 | estado da sessão |
| Tailwind CSS 3 | estilos, sem nenhum estilo inline |
| Vitest, Testing Library e Firebase Emulator Suite | testes de unidade, de tela e das regras de segurança |

O porquê de cada escolha está em `docs/arquitetura.md`.

## Como rodar localmente

Requisitos: Node.js 24 (a versão está em `.nvmrc`) e, para os testes das regras, Java 21.

```bash
git clone https://github.com/sphcl/luminsight.git
cd luminsight
nvm use
npm ci
cp .env.example .env   # preencha com a configuração do projeto Firebase
npm run dev
```

As seis variáveis `VITE_FIREBASE_*` identificam o projeto Firebase. Elas são públicas por natureza e
vão no código entregue ao navegador; quem protege os dados são as Firestore Rules
(`docs/seguranca.md`, seção 9.1).

### Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | verificação de tipos e build de produção |
| `npm run type-check` | só a verificação de tipos |
| `npm run lint` | lint, sem nenhum aviso tolerado |
| `npm run test:run` | todos os testes uma vez |
| `npm run test:coverage` | testes com a cobertura mínima exigida no CI |
| `npm run test:rules` | testes das Firestore Rules contra o emulador (precisa de Java) |
| `npm run audit:check` | auditoria de dependências; falha em vulnerabilidade alta ou crítica fora dos riscos aceitos |
| `npm run analyze` | build com o mapa do tamanho de cada pedaço do código |
| `npm run seed` | publica o conteúdo de `src/content/` no Firestore (precisa da credencial de administrador) |
| `npm run export:results` | exporta os dados da pesquisa para CSV, só lendo o banco (precisa da credencial e da chave da exportação) |
| `npm run mobile:seed`, `npm run mobile:measure` | medição manual de largura em 390 px (`scripts/medicao-mobile/README.md`) |
| `npm run dev:complete-modules` | só para teste manual: marca módulos como concluídos numa conta |

### Credencial de administrador

O seed, a exportação e o `dev:complete-modules` usam o Firebase Admin SDK, que ignora as regras de
segurança. Por isso precisam de uma credencial de administrador, que nunca entra no repositório:

1. No console do Firebase, abra o projeto e vá em **Configurações do projeto > Contas de serviço**.
2. Clique em **Gerar nova chave privada**.
3. Salve o arquivo em `~/.config/luminsight/service-account.json`, fora do repositório, ou aponte
   outro caminho com `FIREBASE_SERVICE_ACCOUNT_PATH`.

A exportação precisa também de uma chave para o identificador anônimo, gerada uma vez com
`openssl rand -hex 32 > ~/.config/luminsight/export-key` (`docs/modelagem.md`, seção 4.2).

## Como contribuir

1. Crie uma branch a partir da `develop` (`feature/...`, `fix/...`, `chore/...`, `docs/...`).
2. Faça commits de uma linha no padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
3. Abra um pull request para a `develop`. O CI roda tipos, lint, auditoria de dependências, testes
   com cobertura mínima, testes das regras e build; se tudo passar, publica uma prévia no canal
   `staging` do Firebase Hosting.
4. As branches `main` e `develop` só aceitam merge por pull request, com o CI verde e a branch
   atualizada com a base.
5. A `main` publica em produção pelo `deploy.yml`, depois de aprovação manual.

## Estrutura de pastas

```
src/
  pages/        uma pasta por tela
  features/     funcionalidades: autenticação, trilha, quiz, simulações, pesquisa, preferências
  components/   componentes de interface reaproveitados
  services/     única camada que fala com o Firestore e com o Auth
  content/      conteúdo da trilha em código
  lib/          configuração do Firebase e do roteador
  utils/security/  validações de segurança
scripts/        seed, exportação, auditoria de dependências e medição em 390 px
tests/rules/    testes das Firestore Rules
docs/           documentação do projeto
```

## Documentação

- `docs/arquitetura.md`: visão geral, stack, camadas e fluxo de dados.
- `docs/seguranca.md`: modelo de ameaça, regras, cabeçalhos, dependências, deploy e dados da
  pesquisa.
- `docs/modelagem.md`: dados gravados, regras explicadas uma a uma e exportação.
- `docs/usabilidade.md`: o que os testes com usuários encontraram e o que mudou.
- `docs/fases/`: o que foi feito em cada fase do projeto.

## Autores

- Eduarda Marques Silva
- Igor Santana Rosa
- Jamily Vitoria de Freitas Lima
- Murillo Sansão Pardal
- Sophia Cardoso de Lima

**Orientadora:** Dra. Eliane Veiga Porta
