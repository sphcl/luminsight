# Segurança do LumInsight

Este documento registra as decisões de segurança do LumInsight. Cada decisão é apresentada com a
ameaça que ela mitiga, o mecanismo usado, o local no código e o que ficou de fora. A organização
segue as categorias do OWASP Top 10 (edição 2021) quando a categoria se aplica.

## 1. Contexto e modelo de ameaça

### 1.1 Arquitetura

O LumInsight é uma aplicação de página única (SPA) em React, servida como arquivos estáticos pelo
Firebase Hosting. Não existe servidor de aplicação próprio. O navegador fala diretamente com dois
serviços do Google:

- **Firebase Authentication**: cadastro, login com email e senha, login com Google e emissão de
  tokens de sessão.
- **Cloud Firestore**: banco de dados de documentos onde ficam o perfil do usuário, o progresso na
  trilha, o histórico de quizzes e o conteúdo (módulos, lições e simulações).

A consequência mais importante dessa arquitetura é que **todo código que roda no navegador está
sob controle do usuário**. Qualquer validação feita em React pode ser contornada por quem abre o
console do navegador e chama o SDK do Firebase diretamente. Por isso a única barreira de
autorização que realmente vale é a das **Firestore Security Rules** (`firestore.rules`), avaliadas
pelos servidores do Google a cada leitura e escrita. As validações no cliente existem para dar
retorno rápido ao usuário e manter os dados corretos no caminho normal, mas a segurança não depende
delas.

### 1.2 Ativos protegidos

| Ativo | Por que importa |
| --- | --- |
| Dados de conta (nome, email, foto) | Dados pessoais, sujeitos à LGPD |
| Resposta do onboarding sobre ter caído em golpe | Dado sensível sobre a vida do usuário |
| Progresso e notas de quiz | Integridade do registro de aprendizado |
| Conteúdo da trilha | Integridade do material didático |
| Sessão do usuário | Quem obtém o token age como o usuário |

### 1.3 Atacantes considerados

1. **Visitante anônimo**: não tem conta e tenta ler ou escrever dados.
2. **Usuário autenticado malicioso**: tem conta legítima e usa o console do navegador para ler
   dados de outros, escrever em nome de outros ou forjar os próprios dados.
3. **Site de terceiros**: tenta embutir o LumInsight num iframe (clickjacking), injetar script ou
   usar a sessão do usuário a partir de outro domínio.
4. **Dependência comprometida ou vulnerável**: um pacote npm com falha conhecida.

Ficam fora do escopo: comprometimento da conta Google do próprio desenvolvedor, falhas na
infraestrutura do Google e ataques físicos ao dispositivo do usuário.

## 2. Auditoria das Firestore Rules

### 2.1 Princípios aplicados

- **Negar por padrão.** Nenhuma coleção é acessível se não houver uma regra explícita liberando o
  acesso. Ao final do arquivo existe um `match /{document=**}` que nega leitura e escrita. Nas
  Firestore Rules várias regras que casam com o mesmo documento são combinadas com OU, então esse
  bloco não restringe as coleções listadas acima dele. O papel dele é garantir que uma coleção nova,
  esquecida no arquivo, nasça bloqueada em vez de aberta.
- **Lista fechada de campos.** Toda escrita confere `keys().hasOnly([...])`. Um campo que o
  aplicativo não grava não pode ser gravado por ninguém.
- **Datas do servidor.** Todo campo de data tem que ser igual a `request.time`, que é o valor em que
  o Firestore transforma o `serverTimestamp()`. Uma data montada no cliente com `new Date()` é
  recusada.
- **Identidade vem do token.** O dono de um documento é comparado com `request.auth.uid`, que vem do
  token assinado pelo Firebase Auth. Nenhuma regra confia num identificador enviado no corpo da
  requisição sem compará-lo com o token.

### 2.2 Coleção `users/{userId}`

| Pergunta | Resposta |
| --- | --- |
| Quem lê | Somente o próprio usuário (`request.auth.uid == userId`). |
| Quem escreve | Somente o próprio usuário, em quatro operações fechadas: criação do documento, registro de login, conclusão do onboarding e troca de nome. Exclusão é sempre negada. |
| O que impede agir em nome de outro | O `userId` do caminho tem que ser igual ao `uid` do token. Além disso, o email gravado na criação tem que ser o email do token (`request.auth.token.email`), então ninguém cria um documento com o email de outra pessoa. |
| O que impede dado forjado | Na criação: `role` obrigatoriamente `'user'`, progresso zerado, datas do servidor, lista fechada de campos, nome com até 100 caracteres e foto somente `https://` com até 2048 caracteres. No update: cada operação só pode alterar os próprios campos (`diff().affectedKeys().hasOnly(...)`). O nome segue as mesmas regras do cadastro (2 a 60 letras, sem números nem símbolos). As respostas do onboarding precisam ser valores do enum e só podem ser gravadas uma vez. |

**`role` imutável.** O update exige `request.resource.data.role == resource.data.role` em qualquer
caminho e, além disso, nenhuma das três operações de update inclui `role` na lista de campos que
podem mudar. São duas barreiras independentes.

**Resposta sensível do onboarding.** A pergunta "você ou alguém próximo já caiu em um golpe
digital" só aceita `sim`, `nao` ou `prefiro_nao_responder`. As rules recusam qualquer texto livre,
então não há como um relato pessoal acabar gravado no banco. A resposta também não é exibida em
nenhuma tela depois do onboarding.

### 2.3 Subcoleção `users/{userId}/progress/{moduleId}`

| Pergunta | Resposta |
| --- | --- |
| Quem lê | Somente o dono. |
| Quem escreve | Somente o dono, criando e atualizando. Exclusão é sempre negada. |
| O que impede agir em nome de outro | O `userId` do caminho tem que ser igual ao `uid` do token. |
| O que impede dado forjado | O `moduleId` tem que existir na coleção `modules`. A lista de campos é fechada e todos são obrigatórios. A nota é um inteiro de 0 a 100. A lista de lições concluídas não pode ter mais itens do que o módulo tem lições. As datas vêm do servidor. |

Além da forma, as rules impõem que **o progresso só anda para frente**:

- o documento nasce com no máximo uma ação feita (uma lição, uma tentativa de quiz ou a simulação),
  que é exatamente o que o aplicativo cria;
- lições concluídas não podem ser removidas (`hasAll` da lista anterior);
- a simulação concluída não pode ser desmarcada;
- o contador de tentativas só sobe de um em um, e a nota só muda junto com uma tentativa nova;
- a melhor nota nunca diminui;
- `startedAt` nunca muda e `completedAt`, depois de gravado, também não;
- `completedAt` só pode ser gravado se o próprio documento já mostra o módulo concluído (todas as
  lições, nota mínima de 70 e simulação, quando o módulo tem uma).

Essas restrições não resolvem o problema descrito na seção 4, mas reduzem o que um usuário
malicioso consegue fazer a "declarar" ações que o aplicativo faria de qualquer forma, sem
conseguir apagar histórico nem criar estados impossíveis.

### 2.4 Coleção `quizResults/{resultId}`

| Pergunta | Resposta |
| --- | --- |
| Quem lê | Somente o usuário dono do resultado (`resource.data.userId == request.auth.uid`). Uma consulta sem o filtro `where('userId', '==', uid)` é recusada inteira, porque o Firestore exige que a regra seja verdadeira para todos os documentos que a consulta poderia devolver. |
| Quem escreve | Qualquer usuário autenticado pode criar resultados para si mesmo. Alteração e exclusão são sempre negadas. |
| O que impede agir em nome de outro | O campo `userId` tem que ser igual ao `uid` do token. |
| O que impede dado forjado | Lista fechada de campos. Data do servidor. Módulo existente. A nota tem que ser exatamente `floor(acertos * 100 / total)`, o mesmo cálculo do aplicativo. `passed` tem que ser coerente com a nota mínima de 70. Tempo entre 0 e 24 horas. Lista de respostas não maior que o total de perguntas. |

**Imutabilidade.** `allow update: if false` e `allow delete: if false`. Uma vez gravado, o
resultado de uma tentativa reprovada não pode ser reescrito como aprovado nem apagado.

### 2.5 Conteúdo: `modules`, `modules/{id}/lessons` e `simulations`

| Pergunta | Resposta |
| --- | --- |
| Quem lê | Qualquer usuário autenticado. Visitantes anônimos não leem. |
| Quem escreve | Ninguém pelo cliente (`allow write: if false`). O conteúdo entra pelo script `scripts/seed-modules.ts`, que usa o Firebase Admin SDK com uma credencial de administrador que nunca vai para o repositório nem para o navegador. |
| O que impede agir em nome de outro | Não se aplica: não há dado por usuário. |
| O que impede dado forjado | Escrita bloqueada. Além disso, o aplicativo valida com Zod tudo o que lê do Firestore (`src/utils/security/firestore-validators.ts`) e descarta documentos fora do formato, então nem um erro no seed quebra a interface. |

### 2.6 Checklist da auditoria

| Item verificado | Situação |
| --- | --- |
| Nenhuma coleção sem regra explícita | Atendido. As coleções usadas pelo app são `users`, `users/*/progress`, `modules`, `modules/*/lessons`, `simulations` e `quizResults`, todas com regra própria. |
| Catch-all final bloqueando tudo | Atendido. `match /{document=**} { allow read, write: if false; }`. |
| `role` imutável em qualquer caminho de update | Atendido, com duas barreiras (seção 2.2). |
| `quizResults` imutável depois de criado | Atendido. |
| Validação de tipo e forma em toda escrita | Atendido em todas as coleções graváveis. |
| `serverTimestamp` validado onde houver data | Atendido em `createdAt`, `lastLoginAt`, `startedAt`, `completedAt` (progresso e quiz) e `lastUpdatedAt`. |

### 2.7 Problemas encontrados e corrigidos nesta fase

| Problema | Impacto | Correção |
| --- | --- | --- |
| `quizResults` só conferia o `userId` | Gravar nota 100 sem ter feito o quiz, data inventada e campos arbitrários | Validação completa de forma e coerência da nota |
| Progresso sem lista fechada de campos | Gravar campos arbitrários no documento | `hasOnly` e `hasAll` |
| Progresso aceitava qualquer `moduleId` | Encher a subcoleção com módulos inexistentes | `exists()` em `/modules` |
| Update de progresso sem regra de evolução | Zerar tentativas, apagar lições, desmarcar simulação, marcar conclusão sem cumprir as etapas | Regras de "só anda para frente" (seção 2.3) |
| Criação do usuário aceitava qualquer email | Documento com o email de outra pessoa | Email amarrado ao token |
| Nome e foto sem limite na criação | Documentos inflados e URL arbitrária na foto | Limites de tamanho e `https://` obrigatório |

### 2.8 Testes das rules

Os testes ficam em `tests/rules/firestore.rules.test.ts` e rodam contra o **Firebase Emulator
Suite**, que executa o mesmo motor de regras da produção, localmente. Cada teste é uma tentativa
de ataque e verifica se a operação foi recusada (`assertFails`). Há também alguns casos legítimos
(`assertSucceeds`) para garantir que as regras não bloqueiam o uso normal.

Exemplos de ataques testados:

- ler o documento, o progresso ou o resultado de quiz de outro usuário;
- escrever progresso na conta de outro usuário;
- criar a conta como `admin` ou se promover a `admin` num update, inclusive escondendo `role` junto
  com uma troca de nome;
- alterar a nota de um quiz já gravado ou apagar o resultado;
- gravar nota incoerente com o número de acertos ou `passed` verdadeiro com nota baixa;
- forjar datas (`createdAt`, `lastLoginAt`, `lastUpdatedAt`, `completedAt`);
- zerar tentativas, baixar a melhor nota, apagar lições, desmarcar a simulação;
- marcar um módulo como concluído sem ter cumprido as etapas;
- gravar texto livre na resposta sensível do onboarding;
- escrever no conteúdo ou numa coleção que não existe nas rules.

Um teste registra de propósito a limitação da seção 4: ele confirma que o usuário **consegue**
declarar nota 100 no próprio progresso. Esse teste existe para que a limitação fique documentada no
próprio código e para que uma mudança futura que a resolva seja percebida.

Como rodar: `npm run test:rules` (requer Java instalado, que o emulador usa). Na integração
contínua o mesmo comando roda a cada push.

## 3. Cabeçalhos HTTP e Content Security Policy

Os cabeçalhos são configurados em `firebase.json` e aplicados pelo Firebase Hosting a todas as
respostas.

| Cabeçalho | Valor | Ameaça mitigada |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Rebaixamento para HTTP e interceptação (SSL stripping). Depois da primeira visita, o navegador só usa HTTPS por um ano. |
| `X-Frame-Options` | `DENY` | Clickjacking em navegadores antigos que não entendem `frame-ancestors`. |
| `X-Content-Type-Options` | `nosniff` | O navegador "adivinhar" o tipo de um arquivo e executar como script algo que não é script. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Vazamento do caminho completo da página (que pode conter ids) para outros domínios. Só a origem é enviada. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Um script injetado pedir acesso a câmera, microfone, localização ou pagamento. O aplicativo não usa nenhum desses recursos. |
| `Content-Security-Policy` | ver abaixo | Execução de script injetado (XSS) e exfiltração de dados. |

### 3.1 Content Security Policy

A política foi montada a partir do que a aplicação realmente carrega. Para isso, o build de
produção foi inspecionado procurando os domínios referenciados pelo código (inclusive os do SDK do
Firebase) e os pontos em que alguma biblioteca injeta estilos ou scripts.

```
default-src 'self';
script-src 'self' https://apis.google.com;
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' https://*.googleusercontent.com;
connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
frame-src https://luminsight-8a8dc.firebaseapp.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

| Diretiva | Origem liberada | Justificativa |
| --- | --- | --- |
| `default-src` | `'self'` | Tudo que não tem diretiva própria só pode vir do próprio domínio. |
| `script-src` | `'self'` | Bundle da aplicação gerado pelo Vite. Não há nenhum script inline no `index.html` de produção. |
| `script-src` | `https://apis.google.com` | O SDK do Firebase Auth carrega `apis.google.com/js/api.js` para montar a comunicação do login com Google por popup. |
| `style-src` | `'self'` | CSS gerado pelo Tailwind no build, servido como arquivo. |
| `style-src` | `https://fonts.googleapis.com` | Folha de estilo da fonte Inter, importada em `src/index.css`. |
| `font-src` | `https://fonts.gstatic.com` | Arquivos da fonte Inter referenciados pela folha acima. |
| `img-src` | `https://*.googleusercontent.com` | Foto de perfil de quem entra com Google. O Google serve essas fotos a partir de subdomínios variados (`lh3`, `lh4`, `lh5`...), por isso o curinga. O risco do curinga é baixo porque ele vale só para imagens. |
| `connect-src` | `https://firestore.googleapis.com` | Leitura e escrita no Firestore. |
| `connect-src` | `https://identitytoolkit.googleapis.com` | API do Firebase Auth: login, cadastro e dados da conta. |
| `connect-src` | `https://securetoken.googleapis.com` | Renovação do token de sessão. |
| `frame-src` | `https://luminsight-8a8dc.firebaseapp.com` | Iframe oculto que o Firebase Auth usa no domínio de autenticação do projeto para concluir o login por popup. |
| `object-src` | `'none'` | Bloqueia plugins (`<object>`, `<embed>`), um vetor clássico de execução de código. |
| `base-uri` | `'self'` | Impede que um `<base>` injetado redirecione todos os caminhos relativos para outro domínio. |
| `form-action` | `'self'` | Impede que um formulário injetado envie dados (como uma senha) para outro domínio. |
| `frame-ancestors` | `'none'` | Ninguém pode embutir o LumInsight num iframe. É a defesa moderna contra clickjacking. |
| `upgrade-insecure-requests` | | Qualquer recurso pedido por HTTP é promovido para HTTPS. |

**Ausência de `'unsafe-inline'` em `style-src`.** A investigação concluiu que dá para eliminar o
`'unsafe-inline'` sem precisar de hashes:

- o Vite gera todo o CSS como arquivo externo em produção;
- o build não contém nenhuma criação de elemento `<style>` (`createElement("style")`) nem uso de
  `insertRule` ou `adoptedStyleSheets`;
- os estilos dinâmicos do React (como a largura da barra de progresso) são
  aplicados pela API CSSOM (`elemento.style.propriedade = valor`), que a CSP não bloqueia. A CSP
  bloqueia atributos `style` escritos no HTML e elementos `<style>`, que a aplicação não usa.

Hashes seriam necessários se existisse algum bloco `<style>` fixo no HTML, o que não acontece. O
mesmo raciocínio vale para `script-src`: não há `'unsafe-inline'` nem `'unsafe-eval'`.

**O que ficou de fora.**

- O domínio de autenticação está escrito na política (`luminsight-8a8dc.firebaseapp.com`). Se o
  projeto Firebase mudar, a CSP precisa ser atualizada junto.
- O SDK do Firebase Auth também contém referências a `www.google.com/recaptcha`. Elas só são usadas
  em login por telefone ou quando a proteção reCAPTCHA Enterprise está ativa no projeto, e o
  LumInsight não usa nenhum dos dois. Se um desses recursos for ativado, o domínio precisa ser
  liberado.
- A biblioteca de iframes do Google (`api.js`) não é código do projeto. Se ela aplicar estilos por
  atributo `style` em algum navegador, a CSP vai bloquear esse estilo e registrar o bloqueio no
  console. Por isso a política deve ser validada servindo o build com os cabeçalhos pelo emulador
  do Hosting e conferindo o console do navegador durante o cadastro, o login com email e o login
  com Google.
- A fonte poderia ser hospedada no próprio domínio para remover dois domínios externos da política.
  Foi mantida no Google Fonts por simplicidade. O risco residual é o Google Fonts servir conteúdo
  diferente, e mesmo assim ele só pode afetar estilos e fontes, não scripts.

## 4. Limitação conhecida: progresso gravado pelo cliente

**Ameaça.** O progresso (lições concluídas, tentativas e notas de quiz, simulações concluídas) é
gravado pelo próprio navegador, por meio das funções `markLessonCompleted`, `saveQuizAttempt`,
`markSimulationCompleted` e `markModuleCompleted` (`src/services/progress.service.ts`). Um usuário
autenticado pode abrir o console do navegador, chamar o SDK do Firestore diretamente e registrar
que concluiu lições que não leu ou que tirou 100 num quiz que não fez.

**O que as rules conseguem e o que não conseguem impedir.** As rules garantem que o usuário só
mexe no próprio progresso, que os dados têm a forma correta, que o progresso só avança e que a
conclusão de um módulo é coerente com as etapas registradas (seção 2.3). O que elas não conseguem
saber é se a ação aconteceu de fato. As rules veem apenas o documento que está sendo gravado. Elas
não têm como verificar que o usuário passou o tempo mínimo numa lição ou que as respostas do quiz
estavam certas, porque o gabarito fica no aplicativo e não no banco.

**Impacto real.** O usuário só prejudica o próprio aprendizado. As rules impedem que ele leia ou
altere dados de qualquer outra pessoa, e o LumInsight não tem ranking, certificado nem qualquer
recurso em que o progresso de um usuário afete terceiros. A integridade do registro de cada usuário
depende da boa-fé dele, mas a confidencialidade e a integridade dos dados dos outros não são
afetadas.

**Solução completa.** A decisão de que algo foi concluído precisa sair do navegador e ir para um
ambiente que o usuário não controla. No ecossistema Firebase isso seria feito com **Cloud
Functions**:

1. o cliente envia as respostas do quiz para uma função, e não a nota;
2. a função, que tem o gabarito guardado no servidor, corrige e grava o resultado com o Admin SDK;
3. as rules passam a negar qualquer escrita de progresso pelo cliente (`allow write: if false`).

O mesmo valeria para o tempo de leitura das lições, com a função registrando o início e o fim. Essa
solução não foi implementada porque o Cloud Functions exige o plano pago Blaze do Firebase, fora do
orçamento deste trabalho. A arquitetura já está preparada para a mudança: toda escrita de progresso
passa pelos serviços em `src/services/`, então trocar a escrita direta por uma chamada de função
afeta poucos arquivos.

O mesmo raciocínio se aplica ao gabarito dos quizzes, que fica no bundle JavaScript. Ele não está
no Firestore, então não existe uma consulta estruturada que devolva as respostas, mas quem inspecionar
o código do aplicativo consegue lê-lo. Com Cloud Functions o gabarito também passaria para o servidor.

## 5. Revisão de superfície de ataque

Foi feita uma varredura no código-fonte (`src/`, `scripts/` e `index.html`) e no build de produção.

| Verificação | Resultado |
| --- | --- |
| `dangerouslySetInnerHTML` | Nenhum uso. Todo texto é renderizado pelo React, que escapa HTML. |
| `eval`, `new Function`, `setTimeout` com string | Nenhum uso. O ESLint tem a regra `security/detect-eval-with-expression` como erro. |
| `console.log` fora de guarda de DEV | Nenhum em `src/`. Os `console.error` e `console.warn` existentes ficam dentro de `if (import.meta.env.DEV)`, então não aparecem em produção. O ESLint barra `console.log` (`no-console`). Os scripts de linha de comando em `scripts/` usam `console.log` porque essa é a interface deles. |
| Dados sensíveis em `localStorage` ou `sessionStorage` | O código do projeto não usa nenhum dos dois. O SDK do Firebase Auth guarda o token de sessão no IndexedDB do navegador, que é o comportamento padrão dele. Esse token fica acessível a um script que conseguisse rodar na página, e é por isso que a CSP (seção 3.1) é a defesa principal contra roubo de sessão. |
| Erro do Firebase vazando código interno | Nenhum. Todo erro passa por `mapAuthError` ou `mapFirestoreError` (`src/utils/security/errors.ts`), que devolvem mensagens genéricas. Os erros de credencial ("usuário não existe" e "senha errada") devolvem a mesma mensagem, para não permitir descobrir quais emails têm conta. |
| Link externo sem `rel="noopener noreferrer"` | O único link externo é o bloco de vídeo das lições (seção 5.1), que usa `target="_blank"` com `rel="noopener noreferrer"`. O outro `<a href>` literal é o link de pular para o conteúdo, interno à página. As fotos do Google são carregadas com `referrerPolicy="no-referrer"`. |
| Entrada de usuário sem validação Zod | Login, cadastro, onboarding e edição de nome usam Zod. Quiz e simulações usam apenas opções predefinidas, e o quiz é recorrigido pelo gabarito em vez de confiar no que veio da tela. O parâmetro `redirect` da URL passa por `getSafeRedirectPath` (proteção contra open redirect). **Corrigido nesta fase:** os parâmetros de rota (`moduleId`, `lessonId`, `simulationId`) iam direto para os caminhos do Firestore. Agora passam por `parseRouteId` (`src/utils/security/route-params.ts`), que só aceita o formato dos ids de conteúdo. |

### 5.1 Vídeos nas lições

Os módulos 1 e 3 indicam vídeos do YouTube. A forma mais comum de exibir esses vídeos seria um
`<iframe>` incorporado, mas isso exigiria liberar `https://www.youtube.com` em `frame-src` na CSP e
carregar dentro da página um conteúdo de terceiro, com scripts próprios e rastreamento, que o
projeto não controla.

Por isso o vídeo entra como um bloco do tipo `video`, renderizado como um cartão de link
(`src/features/modules/components/ContentBlockRenderer.tsx`):

- abre em nova aba com `rel="noopener noreferrer"`, então a página do YouTube não recebe referência
  para a janela do LumInsight (`window.opener`) nem o endereço da lição de onde o usuário veio;
- a URL precisa ser `https://` em três pontos independentes: no validador de conteúdo antes do
  seed (`src/content/validate.ts`), no Zod que valida o que é lido do Firestore
  (`src/utils/security/firestore-validators.ts`) e no próprio componente antes de virar `href`.
  Um `javascript:` gravado por engano no banco nunca chega a ser clicável;
- a CSP continua sem nenhuma origem em `frame-src` além do domínio de autenticação.

O custo é de usabilidade: o usuário sai da plataforma para assistir. Para um projeto de Segurança da
Informação essa troca é intencional, e a lição avisa que o link abre fora do LumInsight.

## 6. Dependências

### 6.1 Auditoria

`npm audit` foi executado e as vulnerabilidades corrigíveis foram corrigidas:

- `undici`, `source-map-js` e `brace-expansion`: atualizados por `npm audit fix`, sem mudança de
  versão principal.
- `@grpc/grpc-js`: o SDK do Firestore fixa a versão 1.9, que tem falhas conhecidas. Um `overrides`
  no `package.json` força a versão 1.14.6, que corrige essas falhas. No navegador o Firestore não usa
  gRPC (usa WebChannel). O gRPC só é usado quando o SDK roda em Node, nos testes e no script de seed.
- O `firebase-tools`, usado para subir o emulador, não foi adicionado ao `package.json` porque traz
  dezenas de vulnerabilidades em dependências próprias. Ele roda por `npx` com a versão fixa e
  nunca faz parte do aplicativo.

**Risco aceito.** Resta uma vulnerabilidade de severidade alta sem correção disponível:
`braces` até a versão 3.0.3 (GHSA-vfj7-8cjw-p6xm, esgotamento de pilha com padrões aninhados).
A 3.0.3 é a última versão publicada. O pacote entra apenas pelo Tailwind CSS 3, durante o build,
para expandir os padrões de arquivo do `tailwind.config.js`. Esses padrões são fixos e escritos
pelo desenvolvedor, então explorar a falha exigiria controlar o arquivo de configuração, e quem
controla esse arquivo já controla o build inteiro. O pacote não vai para o bundle entregue ao
navegador. A alternativa seria migrar para o Tailwind 4, que não usa `braces`, mas a migração muda a
configuração e parte dos utilitários e foi deixada para depois.

Para a integração contínua continuar barrando qualquer vulnerabilidade nova, o comando
`npm run audit:check` (`scripts/audit-check.ts`) roda o `npm audit` e falha em qualquer
vulnerabilidade alta ou crítica, com exceção da lista de riscos aceitos. Cada item da lista tem a
justificativa ao lado. Por isso o `npm audit --audit-level=high` puro continua acusando o `braces`.

### 6.2 Dependências de produção

Todas foram verificadas como em uso no código.

| Pacote | Por que existe |
| --- | --- |
| `react`, `react-dom` | Biblioteca de interface. O escape automático de texto do React é a primeira defesa contra XSS. |
| `react-router-dom` | Rotas da SPA e os guardas de rota (rotas protegidas, onboarding, somente visitantes). |
| `firebase` | SDK do Firebase Auth e do Firestore. |
| `zod` | Validação de entrada do usuário e de tudo que é lido do Firestore. |
| `zustand` | Estado global da sessão (usuário e documento do usuário). |
| `clsx`, `tailwind-merge` | Composição de classes CSS nos componentes. |

As dependências de desenvolvimento (ESLint, Vitest, Testing Library, TypeScript, Tailwind,
PostCSS, Prettier, Vite, `firebase-admin` para o seed, `tsx` para os scripts e
`@firebase/rules-unit-testing` para os testes das rules) não fazem parte do bundle entregue ao
navegador.

## 7. Mapeamento OWASP Top 10 (2021)

### A01: Quebra de controle de acesso

- **Mitigação:** Firestore Rules com negação por padrão, dono comparado ao token, catch-all final e
  lista fechada de campos (seção 2). Guardas de rota no cliente (`src/lib/router/`) para a
  experiência do usuário, sem que a segurança dependa deles.
- **Open redirect:** `getSafeRedirectPath` (`src/utils/security/redirect.ts`) só aceita caminhos
  internos. Os testes de regressão encontraram uma variante que passava: `/\t/evil.com` (com tab,
  quebra de linha ou retorno de carro). O navegador remove esses caracteres ao montar a URL e o
  caminho vira `//evil.com`, que aponta para outro domínio. O React Router, ao receber uma URL de
  outra origem, troca o `pushState` por `window.location.assign`, então a falha era explorável com
  um link como `/login?redirect=%2F%09%2Fevil.com`. A correção recusa caracteres de controle e, como
  última barreira, resolve a URL e exige que a origem continue a mesma. Cada variante conhecida
  ficou numa tabela de testes em `redirect.test.ts`.
- **Fora:** progresso declarado pelo próprio usuário (seção 4).

### A02: Falhas criptográficas

- **Mitigação:** HTTPS obrigatório pelo Firebase Hosting e HSTS com `preload`. Senhas nunca passam
  pelo código do projeto: o Firebase Auth recebe, armazena com hash e valida.
- **Fora:** a política de senha do cadastro é de no mínimo 8 e no máximo 128 caracteres, sem exigir
  complexidade. O máximo existe para evitar abuso do custo de hash.

### A03: Injeção

- **XSS:** React escapa todo texto, não há `dangerouslySetInnerHTML` nem `eval`, o nome do usuário
  é validado contra símbolos de markup no cadastro e no perfil (e também pelas rules na troca de
  nome), e a CSP sem
  `unsafe-inline` impede a execução de script injetado mesmo que algo escape.
- **Injeção em consultas:** o Firestore não tem linguagem de consulta textual, então não existe
  equivalente a SQL injection. Os ids vindos da URL são validados antes de virar caminho de
  documento (seção 5).

### A04: Design inseguro

- **Mitigação:** a resposta sensível do onboarding foi desenhada como enum fechado, sem campo de
  texto livre, e não é exibida depois. O gabarito dos quizzes fica fora do Firestore. O quiz é
  recorrigido a partir do gabarito em vez de confiar no "acertou" vindo da tela.
- **Fora:** a decisão de conclusão no cliente e o gabarito no bundle (seção 4).

### A05: Configuração incorreta de segurança

- **Mitigação:** cabeçalhos HTTP e CSP (seção 3). Mensagens de erro genéricas, com o código real só
  no console em desenvolvimento. Rules com catch-all. O `.env` e a credencial de administrador estão
  no `.gitignore`.
- **Observação:** a configuração do Firebase no `.env` (incluindo a `apiKey`) é pública por natureza
  e vai no bundle. Ela identifica o projeto, não autoriza nada. A autorização é feita pelas rules.

### A06: Componentes vulneráveis e desatualizados

- **Mitigação:** `npm audit` na integração contínua com lista explícita de riscos aceitos, correção
  das vulnerabilidades com correção disponível e `overrides` onde a dependência intermediária não
  atualiza (seção 6).
- **Fora:** `braces` sem correção, aceito com justificativa.

### A07: Falhas de identificação e autenticação

- **Mitigação:** autenticação delegada ao Firebase Auth (tokens assinados, renovação automática,
  limite de tentativas do próprio serviço). Mensagem única para "usuário não existe" e "senha
  errada", contra enumeração de contas. A tela de login não valida a política de senha, para não
  revelá-la.
- **Fora:** verificação de email e autenticação em dois fatores não foram implementadas.

### A08: Falhas de integridade de software e dados

- **Mitigação:** `package-lock.json` versionado e `npm ci` na integração contínua, para que o build
  use exatamente as versões auditadas. Datas sempre do servidor. Resultados de quiz imutáveis. Dados
  lidos do Firestore validados com Zod antes de chegar à interface.
- **Fora:** a folha de estilo do Google Fonts não tem Subresource Integrity, porque o Google gera o
  CSS de acordo com o navegador e o hash mudaria.

### A09: Falhas de registro e monitoramento

- **Situação:** o projeto não tem registro de eventos de segurança nem alertas. As tentativas
  negadas pelas rules aparecem apenas nas métricas do console do Firebase. Para um ambiente de
  produção real seria necessário um mecanismo de auditoria, que também dependeria de Cloud
  Functions.

### A10: Server-Side Request Forgery

- **Não se aplica:** o projeto não tem servidor próprio que faça requisições a partir de dados do
  usuário.

## 8. Resumo do que ficou de fora

| Item | Motivo | Caminho para resolver |
| --- | --- | --- |
| Progresso e notas declarados pelo cliente | Exige lógica no servidor | Cloud Functions (plano Blaze) |
| Gabarito dos quizzes no bundle | Exige correção no servidor | Cloud Functions |
| `braces` sem correção no Tailwind 3 | Sem versão corrigida publicada | Migrar para o Tailwind 4 |
| Verificação de email e dois fatores | Fora do escopo do TCC | Recursos nativos do Firebase Auth |
| Registro de eventos de segurança | Exige processamento no servidor | Cloud Functions e Cloud Logging |
| Subresource Integrity no Google Fonts | CSS gerado dinamicamente pelo Google | Hospedar a fonte no próprio domínio |
