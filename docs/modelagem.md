# Modelagem dos dados da pesquisa

Este documento descreve o que o LumInsight grava para o capítulo de Resultados do TCC, por que cada
dado existe e as decisões de medida que a banca pode questionar. As regras de segurança e
privacidade desses dados estão em `docs/seguranca.md`, seção 10.

Nada aqui é retroativo. Antes desta fase, as decisões dentro das simulações não eram gravadas, e
esse dado não existe para as simulações concluídas até então. Ele não é reconstruído nem estimado.

## Onde a coleta aconteceu

O projeto tem um único banco Firestore, usado pelo desenvolvimento, pelo canal de preview e pela
produção (`docs/seguranca.md`, seção 9.4). Até o primeiro deploy de produção, quem usou o site
acessou o canal de preview `staging`, que já gravava nesse banco. As 9 contas e os 39 resultados de
quiz existentes quando esta fase começou foram coletados assim, antes de o endereço de produção
existir.

O primeiro deploy de produção é uma mudança de endereço, não o início da coleta. Por isso há dados
com data anterior à do deploy, e eles são válidos do mesmo jeito: vieram do mesmo código e do mesmo
banco.

## 1. Onde cada dado fica

| Dado | Onde | Quem tem | Gravado quando |
| --- | --- | --- | --- |
| Consentimento | `users/{uid}.researchConsent` | todo mundo que passou pelo aviso | no onboarding, no aviso único das contas antigas ou no Perfil |
| Conhecimento de antes | `users/{uid}.onboardingProfile.securityKnowledge` | todo mundo | no onboarding |
| Percepção de risco de antes | `users/{uid}.riskBaseline` | só quem aceitou | no onboarding ou no aviso único |
| Progresso | `users/{uid}/progress/{moduleId}` | todo mundo | ao concluir lição, quiz ou simulação |
| Tentativas de quiz | `quizResults` | todo mundo | ao terminar cada quiz |
| Tentativas de simulação | `simulationResults` | só quem aceitou | ao terminar cada simulação |
| Pós-teste e satisfação | `trailFeedback/{uid}` | só quem aceitou e concluiu a trilha | na tela de encerramento |

### 1.1 `researchConsent`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `accepted` | bool | só pode ser verdadeiro com `isAdult` verdadeiro |
| `isAdult` | bool | declaração de ter 18 anos ou mais; idade nunca é gravada |
| `decidedAt` | timestamp do servidor | horário da última decisão |
| `version` | `onboarding-v2` ou `retroativo-v2` | qual texto a pessoa viu (`src/content/research.ts`) |

A v1 dos dois textos tinha uma linha de contato que nunca recebeu o e-mail real, e foi retirada
antes de qualquer pessoa ver o aviso. Por isso nenhum documento tem `onboarding-v1` ou
`retroativo-v1`: a v2 é a primeira versão mostrada.

A decisão que vale é a atual. Quem revogou e depois aceitou de novo está dentro; quem aceitou e
depois revogou está fora, inclusive do que gravou antes de revogar.

### 1.2 `riskBaseline`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `riskPerception` | `muito_baixa`, `baixa`, `alta`, `muito_alta` | resposta à pergunta da seção 2 |
| `collectedAfterUse` | bool | verdadeiro quando foi perguntado depois de a pessoa já usar o site |

`collectedAfterUse` existe para não misturar dado contaminado com linha de base. Para as 9 contas
criadas antes desta fase, a pergunta aparece junto do aviso único, depois de elas já terem usado o
site:

- para quem ainda não tinha concluído a trilha, serve como linha de base razoável, desde que
  analisada separada;
- para quem já tinha concluído a trilha, não serve como "antes", porque a pessoa já passou por todo
  o conteúdo.

A exportação precisa separar os três grupos: antes de verdade (`collectedAfterUse: false`), depois
de usar sem ter concluído, e depois de concluir. O segundo e o terceiro grupo se distinguem
cruzando com `progress/modulo-05.completedAt` e com `researchConsent.decidedAt`.

### 1.3 `simulationResults`

Um documento por tentativa, no mesmo padrão de `quizResults`.

| Campo | Tipo |
| --- | --- |
| `userId` | uid do dono |
| `simulationId` | id da simulação (`simulacao-modulo-0X`) |
| `moduleId` | módulo da simulação, conferido pelas rules |
| `completedAt` | timestamp do servidor |
| `totalDecisions` | int, 1 a 50 |
| `correctDecisions` | int, 0 a `totalDecisions` |
| `timeSpentSeconds` | int, 0 a 86400, do início ao fim da simulação |
| `decisions` | lista de `{ sceneId, selectedOptionId, isCorrect }`, no caminho percorrido |

Como as simulações podem ramificar, a lista guarda só o caminho que a pessoa percorreu.

### 1.4 `trailFeedback`

O id do documento é o próprio uid, o que garante uma resposta por pessoa.

| Campo | Valores |
| --- | --- |
| `securityKnowledge` | `iniciante`, `intermediario`, `avancado` (mesma pergunta do onboarding) |
| `riskPerception` | `muito_baixa`, `baixa`, `alta`, `muito_alta` (mesma pergunta do onboarding) |
| `satisfaction` | `gostei_muito`, `gostei`, `indiferente`, `nao_gostei`, `nao_gostei_nada` |
| `mostUseful` | lista com `licoes`, `quizzes`, `simulacoes`, ou só `nada` |
| `comment` | texto opcional, até 500 caracteres, dado não confiável |
| `submittedAt` | timestamp do servidor |

"Mais útil" é múltipla escolha porque lições, quizzes e simulações não competem entre si; escolha
única inventaria um ranking que não existe. "Nada em especial" é exclusiva.

## 2. Percepção de risco: escala de 4 pontos, sem meio

Pergunta: "Na sua opinião, qual a chance de você cair em um golpe digital?"

Alternativas: Muito baixa, Baixa, Alta, Muito alta.

**Decisão.** A escala não tem opção neutra ("Média").

**Motivo.** O tamanho da amostra. Com 9 contas hoje e talvez 30 no fim do estudo, uma escala de 5
pontos tende a concentrar as respostas no meio, e o deslocamento entre antes e depois some ali. Sem
a opção neutra, a pessoa precisa apontar uma direção, e a direção é o que a comparação mede.

**Custo.** Quem de fato considera a própria chance média é obrigado a escolher um lado, e isso
introduz erro de medida. Esse erro afeta igualmente o antes e o depois, porque as duas perguntas
são idênticas, mas ele existe e precisa ser citado como limitação no capítulo.

## 3. Lista de exclusão

`scripts/research/excluded-accounts.json` guarda os UIDs que nunca entram na exportação, mesmo com
consentimento: contas da equipe e contas de teste do desenvolvimento. O arquivo começa vazio e é
preenchido na fase da exportação.

## 4. Exportação

`npm run export:results` (`scripts/export-results.ts`) lê o banco com o Admin SDK e grava CSV para
análise em planilha. Ela só lê: o acesso ao Firestore fica todo em `scripts/research/read-firestore.ts`,
e um teste falha se aparecer ali qualquer método de escrita no Firestore ou no Auth. A única escrita é
a dos CSV, numa pasta fora do repositório.

### 4.1 Quem entra

Cada conta cai em exatamente uma categoria, nesta ordem:

| Categoria | Regra |
| --- | --- |
| lista de exclusão | UID em `scripts/research/excluded-accounts.json`, mesmo que tenha aceitado |
| sem decisão | conta sem `researchConsent`: conta antiga que ainda não respondeu o aviso |
| incluída | `researchConsent.accepted == true` na decisão atual |
| revogou | `accepted == false` e algum dado de pesquisa gravado |
| recusou | `accepted == false` e nenhum dado de pesquisa |

Só as incluídas aparecem nos CSV, e quem revogou sai por completo, inclusive o que gravou antes de
revogar. O resumo informa as quatro contagens de exclusão separadas.

**Revogação inferida, por escolha.** `researchConsent` guarda só a decisão atual, sem histórico. Uma
recusa com `riskBaseline`, `simulationResults` ou `trailFeedback` gravados só pode vir de quem aceitou
antes, então conta como revogação. O único caso que a inferência erra é quem recusou no onboarding,
aceitou pelo Perfil (que não grava percepção de risco) e revogou sem gravar nenhum dado de pesquisa:
essa pessoa conta como recusa. Como ela não tem dado de pesquisa nenhum, o erro não muda nenhum
número das planilhas, só a contagem entre "recusou" e "revogou". Um campo `revokedAt` resolveria, mas
exigiria mudar rules e dois PRs já em andamento por um ganho que não aparece nos resultados.

### 4.2 Identificador anônimo

Cada pessoa vira os 12 primeiros caracteres hexadecimais de um HMAC-SHA256 do uid, calculado com uma
chave secreta guardada fora do repositório (`~/.config/luminsight/export-key`). A mesma chave gera o
mesmo identificador em toda exportação, o que permite cruzar planilhas de dias diferentes. Sem a
chave, ter a lista de uids não basta para ligar um identificador a uma pessoa, e o identificador não
contém nenhum pedaço do uid. O script para se dois participantes caírem no mesmo identificador.

### 4.3 Arquivos

| Arquivo | Uma linha por |
| --- | --- |
| `usuarios.csv` | participante, com respostas do onboarding, linha de base e grupo dela, pós-teste e pesquisa |
| `progresso.csv` | participante e módulo |
| `quiz.csv` | tentativa de quiz |
| `quiz-questoes.csv` | resposta de questão em cada tentativa |
| `simulacoes.csv` | tentativa de simulação |
| `simulacao-decisoes.csv` | decisão em cada tentativa, na ordem do caminho percorrido |
| `comentarios.csv` | comentário, sem identificador e em ordem embaralhada |

Privacidade:

- `usuarios.csv` traz só a data de criação da conta, sem hora: num grupo pequeno, a hora exata
  reconhece um colega. `progresso.csv` traz data e hora, porque serve para medir duração;
- os comentários ficam num arquivo próprio, sem identificador e embaralhados com sorteio
  criptográfico. Um comentário que identifica a pessoa não arrasta junto o resto dos dados dela;
- todo campo de texto é neutralizado contra fórmula de planilha (regra da OWASP: texto começando com
  `=`, `+`, `-`, `@`, tabulação ou retorno de carro ganha um apóstrofo na frente);
- separador `;` e UTF-8 com BOM por padrão, para o Excel em português; `--separador=,` e `--sem-bom`
  para o Google Planilhas.

Não existe tempo por questão: `quizResults` guarda só o tempo total da tentativa, e a coluna não foi
inventada. O número da tentativa também não é gravado; ele é derivado pela ordem de `completedAt`,
por pessoa e por módulo ou simulação.

### 4.4 Acerto recalculado

O acerto gravado em `quizResults` e em `simulationResults` vem do navegador (`docs/seguranca.md`,
seção 10.4). A exportação recalcula cada resposta e cada decisão pelo gabarito do repositório,
exporta o valor recalculado e conta quantos registros divergem do gravado. Uma divergência pode ser
fraude ou conteúdo alterado depois da resposta, e o script não tem como distinguir as duas. Questão
ou cena que não existe mais no conteúdo fica sem acerto e é contada à parte.

### 4.5 Métricas do resumo

Todo número sai com o tamanho da amostra.

- **Onde parou:** o primeiro módulo da trilha ainda sem conclusão; quem não tem progresso nenhum é
  "não começou".
- **Nota por módulo:** média da primeira tentativa, que mede o efeito das lições, e média da melhor
  tentativa, as duas por pessoa, com a nota recalculada.
- **Acerto nas simulações:** só a primeira tentativa de cada pessoa, que é a reação inicial ao golpe;
  quem refaz já conhece o caminho. Por cena, o total é quem chegou àquela cena.
- **Antes e depois:** as escalas são ordinais, então o resumo mostra a distribuição antes e depois e
  a contagem pareada de quem subiu, desceu ou ficou igual, sem média. O nível de conhecimento compara
  todo mundo que tem onboarding e pesquisa final; a percepção de risco compara só o grupo
  `antes_do_uso`.

### 4.6 Conferência de perda

O resumo cruza `progress.simulationCompleted` com `simulationResults` e informa quantas simulações
concluídas por quem participa não têm registro.

A conferência é exata só para quem aceitou no onboarding: toda simulação concluída por
essa pessoa aconteceu depois do aceite e precisa ter registro. Para as contas antigas, que aceitaram
pelo aviso único, ela é aproximada: o progresso guarda só que a simulação foi concluída, sem a data,
então não dá para saber se a conclusão veio antes ou depois do aceite, e uma simulação concluída
antes do aceite aparece como "sem registro" sem ser perda. Essa limitação fica registrada e não é
corrigida.

Durante os testes, uma gravação que falha duas vezes também aparece no console do navegador como
`[pesquisa] simulationResults não gravado depois de 2 tentativas`, inclusive no build de produção.
Isso ajuda a achar problema testando, mas não substitui a conferência: se a pessoa fechar a aba
antes de a gravação terminar, nada aparece no console.

## 5. Custo das leituras nas rules

Gravar em `simulationResults` e em `trailFeedback` faz as rules lerem dois documentos a mais: o
documento do usuário (consentimento) e a simulação ou o progresso do módulo final. Cada `get()` nas
rules conta como uma leitura.

Estimativa para 30 pessoas no estudo inteiro:

| Gravação | Quantidade estimada | Leituras extras |
| --- | --- | --- |
| Resultado de simulação | 30 pessoas × 3 simulações × 2 tentativas = 180 | 360 |
| Pesquisa final | 30 | 60 |
| Total | | cerca de 420 |

O plano Spark dá 50 mil leituras por dia. Mesmo que o estudo inteiro acontecesse num único dia, o
custo extra seria menos de 1% da cota diária. O card da pesquisa final no painel faz mais uma
leitura por visita, só para quem participa, concluiu e não dispensou.

## 6. Coleções do app, campo a campo

As seções 1.1 a 1.4 tratam dos dados da pesquisa. Esta seção cobre o resto do banco.

### 6.1 `users/{uid}`

Criado no primeiro login (`src/services/user.service.ts`), com o id igual ao uid do Firebase Auth.

| Campo | Tipo | Por que existe |
| --- | --- | --- |
| `displayName` | string | nome mostrado no painel e no perfil; validado contra símbolos de markup |
| `email` | string | igual ao do token, conferido pelas rules na criação |
| `photoURL` | string ou null | foto da conta Google, carregada sem enviar o endereço da página (`no-referrer`) |
| `createdAt`, `lastLoginAt` | timestamp do servidor | data de criação e do último acesso |
| `onboardingCompleted` | bool | os guardas de rota mandam para o onboarding enquanto for falso |
| `onboardingProfile` | mapa de três enums | nível de conhecimento, se já caiu em golpe e motivação; respondido uma vez |
| `role` | sempre `'user'` | não existe papel de administrador no site; o campo é imutável pelas rules |
| `researchConsent`, `riskBaseline`, `trailFeedbackDismissedAt` | ver seções 1.1, 1.2 e 1.4 | pesquisa |
| `completedModules`, `completedLessons`, `completedSimulations`, `totalQuizzesCompleted` | listas e contador | vêm do modelo inicial e nascem vazios; nenhum código os atualiza, e as rules impedem o cliente de mexer neles. O progresso de verdade fica em `progress`. |

### 6.2 `users/{uid}/progress/{moduleId}`

Um documento por módulo iniciado. O caminho amarra o progresso à pessoa e ao módulo, então nenhum
dos dois vira campo.

| Campo | Tipo | Por que existe |
| --- | --- | --- |
| `startedAt` | timestamp do servidor | quando a pessoa começou o módulo; nunca muda |
| `completedAt` | timestamp do servidor ou null | conclusão do módulo; só pode ser gravado quando o próprio documento mostra todas as etapas cumpridas |
| `lessonsCompleted` | lista de ids | lições concluídas; só cresce |
| `quizBestScore` | inteiro de 0 a 100 ou null | melhor nota; só sobe |
| `quizAttempts` | inteiro | tentativas de quiz; sobe de um em um |
| `simulationCompleted` | bool | simulação do módulo concluída; não volta para falso |
| `lastUpdatedAt` | timestamp do servidor | última mudança |

### 6.3 `quizResults/{id}`

Um documento por tentativa, nunca alterado depois de criado: `userId`, `moduleId`, `completedAt`,
`score`, `totalQuestions`, `correctAnswers`, `timeSpentSeconds`, `passed` e `answers` (lista de
`{ questionId, selectedOptionIds, correct }`). As perguntas e o gabarito não ficam no banco: estão
em `src/content/quizzes/`, no bundle, para não existir uma consulta que devolva as respostas certas.
Respostas gravadas antes das questões de múltiplas respostas guardavam uma alternativa só
(`selectedOptionId`); a exportação lê os dois formatos.

### 6.4 Conteúdo: `modules`, `modules/{id}/lessons` e `simulations`

Só leitura para quem está logado. O conteúdo é escrito em `src/content/` e publicado pelo
`npm run seed` com o Admin SDK. O seed valida tudo antes (`src/content/validate.ts`) e apaga do banco
as simulações que não existem mais no código.

| Coleção | Campos principais | Observação |
| --- | --- | --- |
| `modules` | `title`, `description`, `order`, `difficulty`, `estimatedMinutes`, `totalLessons`, `isActive`, `requiredModuleId`, `hasSimulation` | `requiredModuleId` encadeia a trilha; `totalLessons` e `hasSimulation` são lidos pelas rules para validar o progresso |
| `lessons` | `title`, `order`, `content` (blocos tipados), `estimatedMinutes`, `readingTimeSeconds` | `readingTimeSeconds` é a trava do botão de concluir: metade do tempo estimado de leitura, entre 20 e 120 segundos |
| `simulations` | `moduleId`, `title`, `description`, `format` (e-mail, ligação ou chat), `contact`, `scenes`, `conclusion` | cada cena tem as mensagens e uma decisão com opções; `nextSceneId` permite caminhos diferentes |

## 7. Rules, regra a regra

O arquivo é `firestore.rules`. Tudo é negado por padrão, e o último bloco (`match /{document=**}`)
garante que uma coleção esquecida nasce bloqueada.

| Regra | O que garante |
| --- | --- |
| `isSignedIn`, `isOwner` | só há acesso com login, e o dono é sempre o uid do token, nunca um id enviado pelo cliente |
| `isServerTimestamp` | toda data gravada é o horário do servidor (`request.time`) |
| `moduleExists`, `getModule` | progresso e quiz só existem para módulos que existem; o progresso é conferido contra o total de lições do módulo |
| `isValidUserCreate` | conta nasce com `role: 'user'`, progresso zerado, e-mail do token, nome e foto limitados |
| `roleIsImmutable` | nenhum update muda o papel |
| `isLoginUpdate` | registrar acesso só mexe em `lastLoginAt` |
| `isOnboardingCompletion`, `isOnboardingWithConsent` | o onboarding é concluído uma vez, com respostas do enum e a decisão sobre a pesquisa; `consentRequired()` foi a chave da transição descrita em `docs/seguranca.md`, seção 9.3 |
| `isDisplayNameUpdate` | troca de nome com as mesmas regras do cadastro |
| `isValidConsent` | consentimento com os quatro campos, aceite só com a declaração de 18 anos, data do servidor e a versão do texto mostrado |
| `hasBaselineOnlyIfConsented` | percepção de risco existe se e somente se a pessoa aceitou, na escala de 4, com a marcação de quando foi coletada |
| `isLateConsent` | conta antiga decide uma vez; o "antes" dela fica marcado como coletado depois de usar |
| `isConsentChange` | aceitar ou revogar pelo Perfil, sem tocar no que já foi gravado |
| `isFeedbackDismissal` | dispensar o card da pesquisa final só grava o horário da dispensa |
| `hasResearchConsent` | lê o documento do usuário e nega por padrão: sem documento ou sem o campo, não grava dado de pesquisa |
| `isValidSimulationResult` | resultado de simulação coerente, da simulação certa e com tantas decisões quanto o total declarado |
| `isValidTrailFeedback` | pesquisa final só com enums, comentário até 500 caracteres, uma por pessoa e depois de concluir o módulo final |
| `isValidProgressCreate`, `isValidProgressUpdate`, `isModuleCompleteIn` | progresso nasce com no máximo uma ação, só anda para frente e só marca o módulo concluído quando as etapas estão cumpridas |
| `isValidQuizResult` | nota igual a `floor(acertos × 100 / total)`, aprovado coerente com 70, tempo entre 0 e 24 horas |

O que as rules não conseguem fazer, e por quê, está em `docs/seguranca.md`, seções 4 e 10.4.

## 8. Numeração das simulações

Cada simulação tem o número do módulo a que pertence: `simulacao-modulo-02`, `simulacao-modulo-03` e
`simulacao-modulo-04`, em `src/content/simulations/simulation-02.ts`, `simulation-03.ts` e
`simulation-04.ts`. Os módulos 1 e 5 não têm simulação, e a ausência de `simulacao-modulo-01` e
`simulacao-modulo-05` diz isso.

Antes, a numeração era sequencial (`simulacao-01` era a do módulo 2), e isso confundiu três pessoas,
inclusive quem fazia o site (`docs/usabilidade.md`). Para o descompasso não voltar, o
`validateContent` exige que o id de cada simulação seja `simulacao-` seguido do `moduleId`; o teste
e o seed falham se não for. A troca de ids não afetou dado de usuário: o progresso guarda só
`simulationCompleted` por módulo, e nenhum documento de usuário tinha o id de simulação.
