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

## 4. Regras que a exportação precisa seguir

Para a próxima fase:

1. incluir só contas com `researchConsent.accepted == true` na decisão atual;
2. tirar as contas da lista de exclusão;
3. informar separadamente quantas contas ficaram de fora por falta de consentimento e quantas pela
   lista de exclusão, porque os dois números vão para o capítulo;
4. separar a linha de base pelos três grupos da seção 1.2;
5. neutralizar o comentário contra fórmula de planilha antes de gravar CSV;
6. não exportar nome, e-mail nem UID: cada pessoa vira um identificador sequencial gerado na
   exportação;
7. conferir perda de dado: cruzar `progress.simulationCompleted` com `simulationResults` e informar,
   junto dos números de exclusão, quantas simulações concluídas por quem participa não têm registro.

A conferência do item 7 é exata só para quem aceitou no onboarding: toda simulação concluída por
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
