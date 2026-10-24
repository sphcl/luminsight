# Arquitetura do LumInsight

Este documento explica como o LumInsight é construído e por que cada escolha foi feita. Ele foi
escrito para quem avalia o trabalho do ponto de vista de Segurança da Informação, então cada termo
de desenvolvimento web é explicado na primeira vez que aparece.

## 1. Visão geral

O LumInsight é uma trilha de aprendizado sobre engenharia social, phishing e golpes com
inteligência artificial. A pessoa cria uma conta, responde três perguntas sobre o próprio ponto de
partida e percorre cinco módulos, cada um com lições curtas, um quiz e, nos módulos 2, 3 e 4, uma
simulação de golpe com contatos fictícios.

Tecnicamente, o site é uma **aplicação de página única** (SPA, de *single page application*): o
navegador baixa uma vez o código da aplicação e, dali em diante, troca de tela sem recarregar a
página, buscando só os dados de que precisa. Não existe servidor próprio. Os arquivos do site são
estáticos, servidos pelo Firebase Hosting, e o navegador conversa diretamente com dois serviços do
Google:

- **Firebase Authentication**, que cuida do cadastro e do login (e-mail e senha, ou conta Google)
  e emite um token assinado que prova quem é a pessoa a cada requisição;
- **Cloud Firestore**, um banco de dados de documentos, onde ficam o perfil, o progresso, os
  resultados, o conteúdo da trilha e os dados da pesquisa do TCC.

A consequência central dessa arquitetura, desenvolvida em `docs/seguranca.md`, é que todo código que
roda no navegador está sob controle de quem usa o site. A barreira de autorização que vale é a das
**Firestore Security Rules**, um arquivo de regras (`firestore.rules`) que os servidores do Google
avaliam a cada leitura e escrita, antes de tocar no banco.

## 2. Stack e por que cada escolha

| Tecnologia | Versão | Papel | Por que |
| --- | --- | --- | --- |
| React | 19.2 | biblioteca de interface | escapa automaticamente todo texto exibido, o que é a primeira defesa contra injeção de script (XSS); é a biblioteca de interface mais usada, com documentação e ferramentas maduras |
| TypeScript | 6.0 | linguagem | JavaScript com tipos verificados antes de rodar; erros de formato de dado aparecem na compilação, não em produção |
| Vite | 8.3 | ferramenta de build | junta e reduz o código para produção e serve o site durante o desenvolvimento; o projeto sempre usou o Vite 8, desde o primeiro commit |
| React Router | 7.18 | navegação entre telas | define as rotas e os guardas que mandam quem não está logado para o login |
| Firebase (Auth e Firestore) | 12.19 | autenticação e banco | elimina servidor próprio, cabe no plano gratuito (Spark) e oferece regras de segurança avaliadas no servidor |
| Zod | 4.6 | validação de dados | valida tudo que a pessoa digita e tudo que é lido do banco antes de chegar à interface |
| Zustand | 5.0 | estado global | guarda a sessão (usuário e documento do usuário) num único lugar, sem a cerimônia de bibliotecas maiores |
| Tailwind CSS | 3.4 | estilos | classes utilitárias geradas no build; nenhum estilo inline, o que permite uma política de segurança de conteúdo (CSP) sem `unsafe-inline` |
| Vitest e Testing Library | 4.1 | testes | testes de unidade e de tela que rodam no mesmo ambiente de build do projeto |
| Firebase Emulator Suite | 15.33 (via `npx`) | testes das rules | roda localmente o mesmo motor de regras da produção, para testar cada tentativa de ataque |

O plano Spark do Firebase não permite Cloud Functions (código rodando no servidor). Essa restrição de
custo explica as limitações aceitas na `docs/seguranca.md`, seções 4 e 10.4: decisões como "esta
lição foi concluída" são tomadas no navegador e só podem ser verificadas pelas regras na forma, não
no mérito.

## 3. Estrutura de pastas

O critério é separar o que é **tela**, o que é **regra de negócio** e o que é **acesso a dados**,
para que cada camada possa ser testada sem as outras.

```
src/
  pages/        uma pasta por tela (Dashboard, Trilha, Modulo, Licao, Quiz, Simulacao, Perfil...)
  features/     funcionalidades com componentes, hooks, schemas e motor próprios
    auth/         login, cadastro e provedor de sessão
    modules/      trilha, cálculo de status e progresso dos módulos (engine/trail.ts)
    quiz/         motor de correção e telas do quiz
    simulations/  motor das simulações e as interfaces de e-mail, ligação e chat
    research/     consentimento, pesquisa final e registro de falhas da pesquisa
    onboarding/, dashboard/, profile/, preferences/
  components/   peças de interface sem regra de negócio (botão, cartão, cabeçalho, menu lateral)
  services/     única camada que fala com o Firestore e com o Auth
  lib/          configuração do Firebase e do roteador
  content/      conteúdo da trilha em código: módulos, lições, quizzes, simulações, texto do aviso
  types/        formato de cada documento do banco
  utils/security/  validação de redirecionamento, de parâmetros de rota e de dados lidos do banco
scripts/        ferramentas de linha de comando com o Admin SDK: seed, exportação, medição
tests/rules/    testes das Firestore Rules contra o emulador
docs/           esta documentação
public/         arquivos servidos como estão (ícones, imagem de compartilhamento, theme-init.js)
```

Uma regra de lint (verificação automática do código) protege essa separação: o código em `src/`
não pode importar nada de `scripts/` nem o `firebase-admin`, que é o SDK com poderes de
administrador. Assim nenhuma credencial ou função privilegiada chega ao código entregue ao
navegador.

## 4. Fluxo de dados

Um exemplo: a pessoa conclui uma simulação.

1. **Tela.** `pages/Simulacao/Simulacao.tsx` mostra a simulação e recebe o resultado do motor quando
   ela termina.
2. **Motor.** `features/simulations/engine/simulation.ts` é uma função pura (sem banco, sem tela)
   que avalia cada decisão, decide a próxima cena e resume o resultado: acertos, total, caminho
   percorrido e tempo.
3. **Serviço.** A tela chama `services/progress.service.ts` para marcar a simulação como concluída
   e, se a pessoa participa da pesquisa, `services/research.service.ts` para gravar o resultado.
   Cada serviço monta o documento campo a campo; nada do que veio da tela é repassado sem filtro.
4. **Regras.** O Firestore avalia `firestore.rules` antes de gravar: dono, formato, datas do
   servidor, coerência com o módulo e, no caso da pesquisa, o consentimento.
5. **Leitura.** Quando o dado volta (por exemplo, no painel), `utils/security/firestore-validators.ts`
   valida o formato com Zod e descarta o que estiver fora dele, então nem um documento estranho
   quebra a interface.

O conteúdo da trilha segue o caminho inverso: é escrito em `src/content/`, validado por
`src/content/validate.ts` e publicado no banco pelo `npm run seed`, que usa o Admin SDK numa máquina
com a credencial de administrador. O navegador só lê o conteúdo.

## 5. Camadas e responsabilidades

| Camada | Responsabilidade | Testada como |
| --- | --- | --- |
| Telas e componentes | mostrar dados, coletar ações, acessibilidade | testes de tela com Testing Library, simulando cliques e teclado |
| Motores (`engine/`) | regras do quiz, das simulações e da trilha | testes de unidade, sem banco nem tela |
| Schemas (Zod) | validar entrada e saída | testes de unidade com dados válidos e inválidos |
| Serviços | montar e gravar documentos | testes com o Firestore simulado, e um teste que confere cada escrita contra a lista de campos aceita pelas rules |
| Firestore Rules | autorização e integridade no servidor | testes contra o emulador, um por tentativa de ataque |
| Pipeline (GitHub Actions) | verificar e publicar | o próprio CI: tipos, lint, auditoria de dependências, testes com cobertura mínima, testes das rules e build |

## 6. Publicação

Todo pull request roda a verificação completa e, se passar, publica uma prévia num canal temporário
do Firebase Hosting (`staging`). A `main` só recebe código por pull request com a verificação verde.
O deploy de produção roda a mesma verificação, espera aprovação manual e só então publica as rules,
os índices e o site. Os detalhes de credenciais e permissões estão em `docs/seguranca.md`, seção 9.

O site fica em `https://luminsight-tcc.web.app`. O endereço padrão do projeto
(`luminsight-8a8dc.web.app`) redireciona para ele, para não existir uma cópia antiga do app no ar.
