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

- O site é publicado em `https://luminsight-8a8dc.web.app`, sem domínio próprio, por decisão do
  projeto de custar zero. Esse endereço está escrito nas tags `og:url`, `og:image` e
  `twitter:image` do `index.html`, porque o preview de link exige URL absoluta. Se um dia o projeto
  ganhar domínio próprio, essas tags precisam mudar junto, ou o preview quebra sem nenhum erro
  visível.
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

O projeto tem um script de desenvolvimento que faz exatamente isso de propósito:
`scripts/dev-complete-modules.ts` marca módulos como concluídos para uma conta, para testar a trilha
sem percorrer todas as lições à mão. Ele usa o Admin SDK, roda só pela linha de comando com a
credencial de administrador e não faz parte do aplicativo: uma regra do ESLint impede qualquer
arquivo de `src/` de importar `scripts/` ou o `firebase-admin`. A existência dele não amplia a
limitação, porque qualquer usuário já consegue o mesmo resultado na própria conta pelo console do
navegador. O que ele não consegue é tocar na conta de outra pessoa sem a credencial de administrador.

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
| Dados sensíveis em `localStorage` ou `sessionStorage` | Nenhum dado sensível. A única exceção é a preferência de interface (seção 5.2). Fora ela, o código do projeto não usa nenhum dos dois. O SDK do Firebase Auth guarda o token de sessão no IndexedDB do navegador, que é o comportamento padrão dele. Esse token fica acessível a um script que conseguisse rodar na página, e é por isso que a CSP (seção 3.1) é a defesa principal contra roubo de sessão. |
| Erro do Firebase vazando código interno | Nenhum. Todo erro passa por `mapAuthError` ou `mapFirestoreError` (`src/utils/security/errors.ts`), que devolvem mensagens genéricas. Os erros de credencial ("usuário não existe" e "senha errada") devolvem a mesma mensagem, para não permitir descobrir quais emails têm conta. |
| Link externo sem `rel="noopener noreferrer"` | Os únicos links externos são os blocos de vídeo e de link das lições (seção 5.1), que usam `target="_blank"` com `rel="noopener noreferrer"`. O outro `<a href>` literal é o link de pular para o conteúdo, interno à página. As fotos do Google são carregadas com `referrerPolicy="no-referrer"`. |
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

O módulo 5 cita canais oficiais de denúncia (Delegacia Eletrônica, Consumidor.gov.br e CERT.br) e
um caça-palavras externo. Eles usam um bloco `link`, com o mesmo cartão e as mesmas três
validações de `https://` do vídeo, mas com o rótulo "Link externo". Nos dois blocos, o aviso de
que o link abre em nova aba fica dentro do próprio `<a>`, então o leitor de tela anuncia isso junto
com o nome do link. Esses canais usam endereços reais de propósito: a regra de usar só domínios
fictícios (`.example`) vale para cenários que simulam golpe, não para referências institucionais.

O custo é de usabilidade: o usuário sai da plataforma para assistir. Para um projeto de Segurança da
Informação essa troca é intencional, e a lição avisa que o link abre fora do LumInsight.

### 5.2 Exceção: preferência de tema e de tamanho de fonte no `localStorage`

A regra do projeto é não gravar nada no armazenamento do navegador, porque ele é legível por
qualquer script que rode na página. A regra existe para proteger token e dado pessoal. Ela abre
uma exceção para duas chaves de preferência de interface:

| Chave | Valores aceitos | Por que não é sensível |
| --- | --- | --- |
| `luminsight:theme` | `light` ou `dark` | Não identifica a pessoa, não tem relação com sessão nem com conta. |
| `luminsight:font-size` | `md`, `lg` ou `xl` | Idem. |

O motivo de usar o `localStorage` e não o documento do usuário no Firestore é técnico: o tema
precisa ser aplicado antes da primeira pintura da página, senão ela pisca no tema errado. Nesse
momento o React ainda não carregou e não existe sessão do Firebase, então o Firestore não chegaria a
tempo nem para quem está logado, e não existiria nas páginas públicas.

Os valores são tratados como entrada não confiável. Tanto o script que roda antes da pintura
(`public/theme-init.js`) quanto o código da aplicação (`src/features/preferences/preferences.ts`)
só aceitam os valores da tabela, e qualquer outro conteúdo é ignorado. Os acessos ficam dentro de
`try/catch`, então navegação privada ou armazenamento bloqueado não quebram a página. Há testes
para valor fora do enum, para o padrão do sistema e para a escolha manual.

O script de início é um arquivo servido pelo próprio domínio, e não um bloco inline. Assim a CSP
não precisa de `'unsafe-inline'` nem de hash: um hash teria de ser recalculado a cada alteração do
script e falharia em silêncio se alguém esquecesse.

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

## 8. Acessibilidade

O público do LumInsight inclui pessoas idosas, que são as que mais sofrem golpe: segundo a Fundação
Seade, citada na lição 3.2, 82% dos idosos do estado de São Paulo já foram alvo de tentativas. Uma página que essa pessoa não consegue ler, ou que só funciona com mouse, falha justamente
com quem mais precisa dela. Por isso a acessibilidade foi tratada como requisito, com verificação
automatizada sempre que possível.

### 8.1 Contraste medido

Todos os valores abaixo foram calculados com a fórmula de luminância relativa da WCAG 2.1, a partir
das cores definidas em `src/index.css`, e não estimados a olho. O mínimo AA é 4,5:1 para texto
normal e 3:1 para contorno de componente interativo (critério 1.4.11).

| Par | Uso | Claro | Escuro | Mínimo |
| --- | --- | --- | --- | --- |
| Texto principal | texto | 18.88:1 | 17.83:1 | 4.5:1 |
| Texto principal em card | texto | 18.88:1 | 16.44:1 | 4.5:1 |
| Texto secundário | texto | 8.86:1 | 13.11:1 | 4.5:1 |
| Texto secundário em fundo tonal | texto | 8.37:1 | 12.09:1 | 4.5:1 |
| Texto discreto (legendas, rótulos de 11px) | texto | 5.33:1 | 7.70:1 | 4.5:1 |
| Texto discreto em fundo tonal | texto | 5.03:1 | 7.11:1 | 4.5:1 |
| Link e acento | texto | 8.87:1 | 7.30:1 | 4.5:1 |
| Link em card | texto | 8.87:1 | 6.73:1 | 4.5:1 |
| Link em hover | texto | 12.21:1 | 9.62:1 | 4.5:1 |
| Texto do botão primário | texto | 8.87:1 | 7.30:1 | 4.5:1 |
| Texto do botão primário em hover | texto | 12.21:1 | 9.62:1 | 4.5:1 |
| Acento sobre fundo de acento suave | texto | 8.37:1 | 6.27:1 | 4.5:1 |
| Sucesso sobre fundo de sucesso | texto | 5.69:1 | 8.18:1 | 4.5:1 |
| Erro sobre fundo de erro | texto | 6.05:1 | 5.87:1 | 4.5:1 |
| Aviso sobre fundo de aviso | texto | 6.05:1 | 7.36:1 | 4.5:1 |
| Texto principal sobre fundo de erro | texto | 17.37:1 | 14.93:1 | 4.5:1 |
| Texto do botão de perigo | texto | 6.57:1 | 7.00:1 | 4.5:1 |
| Contorno de campo (border-control) | contorno | 3.36:1 | 3.65:1 | 3:1 |
| Contorno de campo em card | contorno | 3.36:1 | 3.36:1 | 3:1 |
| Anel de foco contra o fundo | contorno | 8.87:1 | 7.30:1 | 3:1 |
| Régua decorativa (rule), não é contorno de controle | decorativo | 1.26:1 | 1.43:1 | não se aplica |
| Régua forte (border-strong) do botão secundário | contorno | 18.88:1 | 17.83:1 | 3:1 |

| Faixa e selos de simulação (cores fixas nos dois temas) | Contraste | Mínimo |
| --- | --- | --- |
| Texto da faixa de aviso | 16.03:1 | 4.5:1 |
| Selo "Simulação" da faixa | 7.09:1 | 4.5:1 |
| Selo "Ligação simulada" | 10.69:1 | 4.5:1 |
| Contorno dos botões de decisão (claro) | 4.76:1 | 3:1 |
| Contorno das respostas rápidas do chat | 4.47:1 | 3:1 |
| Contorno dos botões de decisão da ligação | 3.07:1 | 3:1 |

| Par que precisa ser distinguido | Claro | Escuro |
| --- | --- | --- |
| Sucesso contra erro (diferença de luminosidade) | 1.02:1 | 1.48:1 |
| Opção selecionada (régua de acento) contra régua neutra | 7.04:1 | 5.10:1 |

Dois pontos dessa tabela exigiram decisão:

- **Contorno de campo.** A régua decorativa (`#E5E5E5` no claro) tem 1,26:1 contra o fundo, o que é
  correto para separar seções, mas reprova como contorno de campo de texto ou checkbox. Por isso o
  tema tem dois tokens distintos no código: `rule`, para régua decorativa, e `control`, para
  contorno de componente interativo, com 3,36:1 no claro e 3,65:1 no escuro.
- **Botão primário no escuro.** Branco sobre o acento escuro (`#8A96FF`) dá 2,66:1 e reprova. O texto
  do botão no tema escuro é quase preto (`#0D0D0D`), com 7,30:1.

**Cor nunca é o único sinal.** No tema claro, sucesso (`#146C43`) e erro (`#B42318`) têm praticamente
a mesma luminosidade (1,02:1 entre si). Quem não distingue verde de vermelho não os separa pela cor.
Por isso todo acerto e todo erro também aparecem em texto ("Correta", "Sua resposta", "Acertou",
"Errou", "Você acertou!", "Não foi dessa vez."), seguindo o critério 1.4.1 da WCAG. A opção
selecionada no quiz e no onboarding é marcada por uma régua de 3px à esquerda, que contrasta 7,04:1
com a régua neutra no claro e 5,10:1 no escuro, além do próprio controle marcado.

### 8.2 Outras medidas

- **Alvo de toque de 44px** em botões, links de navegação, controles do header (tema, tamanho de
  fonte, menu) e botões de decisão das simulações. Testado no componente `Button`.
- **Foco visível** em todo elemento interativo: anel de 2px no acento com folga no fundo, com 8,87:1
  no claro e 7,30:1 no escuro.
- **Tamanho de fonte** com três níveis (100%, 115% e 130%) no header, que escala a fonte raiz do
  site inteiro. Como os tamanhos usam unidades relativas (`rem` e `em`), texto, espaçamento e alvos
  de toque crescem juntos. A conferência visual do layout nos três níveis é feita no navegador.
- **Navegação completa por teclado.** Há testes que concluem uma lição e um quiz inteiro só com Tab,
  Espaço e Enter, conferindo a ordem do foco e que o foco não se perde ao confirmar uma resposta.
- **Ícones sozinhos** têm `aria-label` que descreve a ação (o botão de tema diz para qual tema vai,
  e não em qual está), e todo SVG decorativo tem `aria-hidden`.
- **Movimento reduzido.** Animações de entrada, a troca de tema e a régua de conclusão de módulo não
  acontecem quando o sistema pede menos movimento (`prefers-reduced-motion`).

## 9. Deploy e configuração do projeto Firebase

### 9.1 As chaves `VITE_FIREBASE_*` são públicas

As seis variáveis do `.env` (`apiKey`, `authDomain`, `projectId`, `storageBucket`,
`messagingSenderId`, `appId`) identificam o projeto Firebase, não autenticam ninguém. O Vite as
copia para dentro do JavaScript no momento do build, então qualquer pessoa que abrir o site consegue
lê-las nas ferramentas de desenvolvedor do navegador. Isso é o funcionamento esperado do Firebase:
o SDK precisa delas no navegador para saber com qual projeto falar.

A segurança dos dados não depende de esconder essas chaves. Ela vem de duas camadas que ficam no
servidor do Google, fora do alcance de quem tem as chaves:

- **Firebase Authentication**, que só emite token para quem provou a identidade (senha ou Google);
- **Firestore Security Rules** (seção 2), que decidem, documento por documento, o que cada token
  pode ler e gravar.

Quem tiver as chaves consegue, no máximo, fazer o que o próprio site já faz: criar uma conta e
mexer só nos próprios dados.

No CI as chaves ficam em GitHub Secrets e são injetadas apenas no passo de build. Isso é higiene de
repositório, não proteção criptográfica: evita que o histórico do git carregue configuração de
ambiente e deixa trocar de projeto sem commit. O valor protegido de verdade nos Secrets é a
credencial das contas de serviço (seção 9.2), essa sim um segredo.

### 9.2 Contas de serviço do pipeline

O deploy não usa o token do `firebase login:ci`, que está obsoleto, não expira e carrega o acesso
da conta pessoal de quem o gerou. Em vez dele, o pipeline usa duas contas de serviço, cada uma com
o mínimo que o seu trabalho exige:

| Conta | Usada em | Papéis |
| --- | --- | --- |
| `github-deploy-preview` | Canal `staging`, a cada pull request | Firebase Hosting Admin, Service Usage Consumer |
| `github-deploy-prod` | Site no ar, rules e índices, a cada push na `main` | Firebase Hosting Admin, Firebase Rules Admin, Cloud Datastore Index Admin, Service Usage Consumer |

Nenhuma das duas tem papel de Editor, Proprietário ou Administrador do Firebase, nem acesso aos
dados do Firestore. A separação existe porque o preview publica código de qualquer branch aberta
em PR: se ele usasse a credencial de produção, um PR conseguiria publicar rules.

O job de produção roda no GitHub Environment `production`, que exige aprovação manual de um
revisor e só aceita a branch `main`. A credencial de produção fica nos secrets desse environment,
então nenhum outro job do repositório consegue lê-la. No runner, o JSON é gravado fora do diretório
de trabalho e apagado ao final do job.

### 9.3 Rules publicadas pelo pipeline

Até a fase 13, as rules eram coladas à mão no console do Firebase. Assim, o arquivo do repositório
e o que estava em produção podiam divergir sem ninguém perceber, e não havia registro de quem
publicou o quê. Agora o `firestore.rules` e o `firestore.indexes.json` são publicados pelo
`deploy.yml`, sempre depois de os testes das rules passarem no emulador (seção 2.8). O repositório
passou a ser a fonte única de verdade, e o histórico do git e o log do GitHub Actions registram
cada publicação. Antes de ligar isso, as rules e os índices do console foram comparados com os
arquivos do repositório e estavam idênticos.

Publicar pelo console continua tecnicamente possível para quem tem acesso ao projeto, mas a próxima
execução do pipeline sobrescreve a mudança.

### 9.4 Desenvolvimento e produção no mesmo banco

O projeto tem um único projeto Firebase (`luminsight-8a8dc`), então o Authentication e o
Firestore usados durante o desenvolvimento são os mesmos do site no ar. Contas e documentos criados
para testar ficam ao lado dos dados de usuários reais.

Riscos dessa escolha:

- um script de desenvolvimento com o Admin SDK (`npm run seed`, `npm run dev:complete-modules`)
  roda contra os dados de produção, sem ambiente intermediário;
- resíduo de teste (contas, progresso, resultados de quiz) se mistura com dados reais e precisa ser
  limpo à mão;
- uma rule nova só é testada contra o emulador antes de ir para o banco real.

O que reduz esses riscos: as rules são testadas no emulador no CI antes de cada deploy, os scripts
de Admin SDK não fazem parte do bundle (seção 4) e exigem a credencial de administrador, que fica
fora do repositório, e o resíduo de teste é revisado antes do primeiro deploy.

A solução completa seria um segundo projeto Firebase só para desenvolvimento, com o pipeline
apontando cada branch para o seu projeto. Para um TCC com poucos usuários, o custo de manter dois
projetos, dois conjuntos de credenciais e dois seeds não compensa, e a escolha fica registrada aqui.

## 10. Dados da pesquisa do TCC

O modelo de dados da pesquisa (coleções, campos e decisões de medida) está em `docs/modelagem.md`.
Esta seção trata só do que tem implicação de segurança e privacidade.

### 10.1 Consentimento

Antes das perguntas do onboarding, a pessoa vê um aviso curto: o site faz parte de um TCC, o que é
coletado (progresso e respostas de quiz e de simulação), que os resultados são publicados só de
forma agregada e anônima, que participar é opcional e que dá para mudar de ideia no Perfil. São
duas caixas, as duas desmarcadas por padrão: "Tenho 18 anos ou mais" e "Aceito participar da
pesquisa". A segunda só fica disponível depois da primeira. Seguir sem marcar nada vale como "não
participa", e o site funciona inteiro do mesmo jeito.

A decisão fica no documento do usuário em `researchConsent`: `accepted`, `isAdult`, `decidedAt`
e `version`. As rules exigem que:

- `accepted` só seja verdadeiro junto com `isAdult` verdadeiro;
- `decidedAt` seja o horário do servidor, nunca uma data enviada pelo cliente;
- `version` seja a do texto que a pessoa viu.

Idade e data de nascimento nunca são gravadas. `isAdult` é só a declaração.

As 9 contas criadas antes do aviso existir veem uma versão própria do texto (`retroativo-v1`), uma
única vez, no próximo acesso. Essa versão diz "inclusive o que você já fez aqui", porque essas
pessoas já têm progresso e respostas gravados. Depois da escolha, o site segue normal.

### 10.2 Minimização travada nas rules

Progresso e resultados de quiz continuam sendo gravados para todo mundo, porque o site precisa
deles para funcionar. Os dados que existem só para a pesquisa só são gravados para quem aceitou:

- `simulationResults` (decisões dentro das simulações);
- `trailFeedback` (pós-teste e satisfação);
- `riskBaseline` (percepção de risco de antes).

Essa regra fica nas rules, e não só num filtro da exportação. A regra lê o documento do usuário e
nega por padrão: se o documento não existe, ou não tem o campo de consentimento, a gravação é
recusada. Os testes de rules cobrem os quatro casos: aceitou, recusou, sem o campo e sem documento.

Custo: cada gravação dessas coleções faz duas leituras a mais dentro das rules (o documento do
usuário e a simulação, ou o progresso do módulo final). Com 30 pessoas, a conta estimada fica em
torno de 400 leituras no estudo inteiro, menos de 1% da cota diária gratuita de 50 mil leituras do
plano Spark. A conta detalhada está em `docs/modelagem.md`.

### 10.3 Revogação e exclusão

A pessoa pode sair da pesquisa a qualquer momento pelo Perfil. Antes de confirmar, a tela diz que
nenhum dado dela entra no trabalho, nem o que já foi gravado, e que o progresso no site continua
igual. Revogar grava `accepted: false` e não apaga nada: as rules continuam sem update e sem delete
nas coleções de resultado (decisão da fase 9). Quem revoga deixa de ter registros novos de pesquisa,
e a exportação deixa a pessoa de fora por completo, olhando a decisão atual de cada conta.

**Pedido de exclusão de verdade.** É feito à mão, por alguém com a credencial de administrador:

1. registrar a data do pedido e o UID, sem copiar dados pessoais para o registro;
2. apagar, pelo console do Firebase ou pelo Admin SDK, nesta ordem: `trailFeedback/{uid}`, os
   documentos de `simulationResults` e de `quizResults` com `userId == uid`, a subcoleção
   `users/{uid}/progress`, o documento `users/{uid}` e a conta no Authentication;
3. conferir que nenhuma das consultas acima devolve mais nada.

Não existe botão de exclusão no site de propósito. Uma exclusão feita pelo cliente exigiria abrir
delete nas rules, e isso permitiria apagar resultados para esconder tentativas.

### 10.4 Limitação aceita: conteúdo das listas e acertos declarados pelo cliente

**Limitação.** As rules não conseguem percorrer uma lista. Em `simulationResults`, elas validam que
`decisions` é uma lista com o tamanho igual a `totalDecisions` e que `correctDecisions` não passa
do total, mas não validam o formato de cada item nem se `isCorrect` é verdade. É a mesma limitação
de `quizResults.answers` e do progresso gravado pelo cliente (seção 4).

**Impacto real.** Quem abrir o console do navegador consegue gravar uma tentativa de simulação
inventada na própria conta, com mais acertos do que teve. O dado de outra pessoa continua
protegido. O efeito é ruído nos números da pesquisa, vindo de um participante que agiu de má-fé
contra a própria participação.

**Por que aceitamos.** A correção completa é a mesma da seção 4: mover a correção para Cloud
Functions, que exige o plano pago. Para uma amostra pequena e conhecida, o risco de alguém forjar
resultado de pesquisa pelo console é baixo, e os dados ficam conferíveis: cada decisão gravada
aponta para uma cena e uma opção que existem no conteúdo, e a exportação pode recalcular o acerto
pelo gabarito e descartar o que não bater.

**Quando rever.** Se o site passar a ter participantes desconhecidos em escala, ou se a exportação
encontrar decisões que não batem com o gabarito, a correção precisa ir para o servidor.

### 10.5 Comentário livre

O comentário da pesquisa final é o único texto livre do site. As rules e o schema limitam a 500
caracteres, e ele é tratado como dado não confiável em qualquer lugar onde aparecer: na tela, o
React já exibe como texto; na exportação, o valor precisa ser neutralizado contra fórmula de
planilha (texto começando com `=`, `+`, `-` ou `@`) antes de ir para CSV.

## 11. Resumo do que ficou de fora

| Item | Motivo | Caminho para resolver |
| --- | --- | --- |
| Progresso e notas declarados pelo cliente | Exige lógica no servidor | Cloud Functions (plano Blaze) |
| Gabarito dos quizzes no bundle | Exige correção no servidor | Cloud Functions |
| `braces` sem correção no Tailwind 3 | Sem versão corrigida publicada | Migrar para o Tailwind 4 |
| Verificação de email e dois fatores | Fora do escopo do TCC | Recursos nativos do Firebase Auth |
| Registro de eventos de segurança | Exige processamento no servidor | Cloud Functions e Cloud Logging |
| Subresource Integrity no Google Fonts | CSS gerado dinamicamente pelo Google | Hospedar a fonte no próprio domínio |
| Desenvolvimento e produção no mesmo banco | Custo de manter dois projetos Firebase | Projeto separado para desenvolvimento |
| Conteúdo das decisões e acertos de simulação declarados pelo cliente | Exige correção no servidor | Cloud Functions (plano Blaze) |
| Exclusão de dados pelo próprio usuário | Exigiria abrir delete nas rules | Procedimento manual (seção 10.3) |
