# Testes com usuários

Este documento registra o que apareceu quando pessoas de verdade usaram o LumInsight, e o que mudou
no site por causa disso. Os testes foram informais: pessoas próximas do grupo usaram o site, em
geral no celular, e relataram o que estranharam. Os participantes aparecem como "Participante 1, 2
e 3", sem nome. Os relatos estão transcritos como foram ditos.

## 1. A numeração das simulações

### O que as pessoas disseram

- **Participante 1:** "esse do gerente só desbloqueia depois que eu fizer o módulo 4, mas como
  aparece pra fazer no módulo 2 por isso me confundi"
- **Participante 2:** "eu fiquei até confuso escrevendo módulo/simulação x e y ent deixa de acordo
  com os respectivos números dos módulos msm"
- **Participante 3**, integrante da equipe que fez o site: ao montar a correção, escreveu errado a
  relação entre simulação e módulo e precisou conferir no código.

O terceiro relato é o mais forte dos três. Se quem fez o site se confunde com a numeração, o
problema não está em quem usa.

### Causa raiz

Eram duas falhas somadas:

1. **Numeração defasada em um.** A simulação do módulo 2 se chamava `simulacao-01`, a do módulo 3,
   `simulacao-02`, e a do módulo 4, `simulacao-03`. O número aparecia na URL, no nome do arquivo e
   no documento do banco, sempre um a menos que o do módulo.
2. **A listagem não dizia a qual módulo cada simulação pertencia.** O módulo só aparecia dentro da
   mensagem de bloqueio, e a mensagem dizia o que estava bloqueado ("Libera quando o módulo Casos
   Reais e Golpes Modernos for desbloqueado"), não o que faltava fazer. A pessoa via a simulação na
   lista, achava que estava disponível, tentava e travava sem entender.

### O que mudou

- Cada card da lista mostra o módulo com número e título juntos, por exemplo "Módulo 4 · Casos
  Reais e Golpes Modernos". Só o título não ajuda quem ainda não decorou a ordem da trilha.
- A mensagem de bloqueio passou a dizer o que falta, calculado do progresso real da pessoa, por
  exemplo "Faltam 2 lições e o quiz do Módulo 3." ou "Faltam 3 lições e o quiz do Módulo 1, e depois
  os módulos 2 e 3."
- As simulações passaram a ter o número do módulo: `simulacao-modulo-02`, `-03` e `-04`, nos
  arquivos e no banco. O `validateContent` impede que o descompasso volte (`docs/modelagem.md`,
  seção 8).

## 2. O site no celular

### O que foi relatado

Depois de testar com o grupo, a Participante 3 reuniu os problemas que apareceram no celular:

- a página inteira ficava mais larga que a tela, e dava para arrastar para o lado;
- o botão Sair ficava fora do enquadramento;
- o texto dos e-mails da simulação cortava na direita;
- o aviso amarelo de simulação ocupava três linhas e atrapalhava;
- o tempo mínimo de leitura travava a pessoa nas lições curtas.

### O estouro em 390 px

**Como foi descoberto.** Pelo relato acima, de um teste num iPhone. A investigação mediu cada tela
num Chrome automatizado emulando um iPhone de 390 px de largura, com toque e fonte padrão,
comparando a largura da página (`document.documentElement.scrollWidth`) com a da tela.

**O que a medição encontrou:**

| Tela | Largura da página |
| --- | --- |
| Login e cadastro | 390 px, sem problema |
| Página inicial sem login | 453 px |
| Todas as telas com login | 611 px |

Eram duas causas independentes:

1. **O cabeçalho.** Com login, ele somava menu, logo, links, três botões de tamanho de fonte, tema,
   avatar e Sair, e chegava a 611 px. Era ele que gerava a rolagem horizontal em todas as telas e
   que deixava o Sair fora da tela.
2. **A caixa de e-mail da simulação.** As prévias da caixa de entrada são cortadas com reticências
   para caber numa linha. Isso impede a quebra de linha, e uma coluna de grid sem limite mínimo
   cresce até caber o texto inteiro: cerca de 2.550 px. A caixa escondia o excesso, então a página
   não ficava mais larga, mas o texto do e-mail aparecia cortado e os botões "Phishing" e "Normal"
   ficavam fora da área visível.

**Por que nenhum teste pegou.** Os mais de 500 testes automatizados rodam em jsdom, uma
implementação do navegador que não calcula layout: para ela, todo elemento tem largura zero e
nenhum CSS é aplicado. Os testes confirmam que o botão Sair existe e funciona, não que ele cabe na
tela. Não havia nenhum teste visual nem medição em largura de celular, e o desenvolvimento era feito
na tela do computador, onde tudo cabia.

**O que mudou:**

- No celular, o cabeçalho com login mostra só o menu, o logo e o avatar. Início, tamanho do texto,
  tema e Sair foram para o menu lateral. Sem login, ficam o logo, um botão "Aa" que abre os três
  tamanhos, o tema e Entrar. O tamanho de fonte nunca some do celular, porque o público precisa
  dele.
- A coluna da caixa de e-mail ganhou limite mínimo zero, e as reticências voltaram a funcionar.
- A medição foi repetida com a fonte no tamanho máximo, que escala o site inteiro. Ela encontrou
  três problemas que a fonte padrão escondia: a tabela de histórico do Perfil passava da tela, o
  avatar do Perfil ficava oval e o aviso de simulação, com 231 px de altura, cobria o botão de
  começar mesmo com a página rolada até o fim. A tabela ganhou rolagem própria, acessível pelo
  teclado. O avatar ganhou proporção fixa. O site passou a reservar no rodapé a altura medida do
  aviso, e não um valor fixo.

Depois das correções, todas as telas medem 390 px nas duas fontes.

### Verificação que ficou

`scripts/medicao-mobile/` mede todas as telas em 390 px, nas duas fontes, com a asserção central:
`scrollWidth` igual à largura da tela. É verificação manual, não roda no CI, porque precisa do
Chrome e dos emuladores do Firebase. O README da pasta explica como rodar.

### O aviso de simulação

O aviso amarelo existe por decisão de segurança: a simulação imita um golpe real, e alguém pode tirar
um print sem o aviso. Por isso ele não podia simplesmente fechar. A solução foi recolher: um botão
"Recolher aviso de simulação" transforma o aviso numa tarja fina que atravessa o rodapé e continua
dizendo "Simulação"; tocar nela expande de novo. O estado recolhido vale só dentro da mesma
simulação e só em memória: cada simulação nova começa com o aviso inteiro.

### O tempo mínimo de leitura

O botão de concluir uma lição fica travado pela metade do tempo estimado de leitura, com um piso.
O piso era de 30 segundos, e nas lições curtas, principalmente as introduções de módulo, a pessoa
ficava esperando com pouco texto na tela. O piso caiu para 20 segundos. As lições longas não
mudaram, porque o tempo já é calculado pelo tamanho do texto:

| Lição | Antes | Depois |
| --- | --- | --- |
| Módulo 1, lição 1 | 30 s | 28 s |
| Módulo 1, lição 2 | 30 s | 29 s |
| Módulo 1, lição 3 | 30 s | 21 s |
| Módulo 2, lição 1 | 30 s | 20 s |
| Módulo 4, lição 1 (Introdução) | 30 s | 20 s |
| Módulo 5, lição 1 | 30 s | 24 s |

## 3. Outros ajustes vindos do uso

- **Cadastro e login sem saída entre si.** Quem errava o botão na página inicial ficava preso. As
  duas telas ganharam um link para a outra.
- **Entrar com Google no cadastro.** O botão só existia no login. Ele foi acrescentado ao cadastro;
  o Google cria a conta no primeiro acesso.
- **Cards da prática quebrando entre 640 e 767 px.** Nessa faixa os cards abriam em duas colunas
  sem a barra lateral, e título e selo dividiam a mesma linha sem poder quebrar. O selo passou a
  nunca quebrar por dentro, e desce para baixo do título quando não cabe.
- **Quiz final.** As caixas que diziam quantas alternativas estavam corretas saíram só do quiz
  final, para elevar a dificuldade do fechamento. Ficou a instrução neutra "Marque todas as
  alternativas corretas.": sem nenhuma instrução, a questão não ficaria mais difícil, ficaria
  quebrada, porque a pessoa não saberia que pode marcar mais de uma.
