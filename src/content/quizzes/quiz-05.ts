import type { QuizQuestion } from '@/types/quiz.types'

export const quiz05Questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    prompt:
      'Phishing pode ser realizado de variadas formas, mas um em particular, o Vishing, é feito:',
    options: [
      {
        id: 'a',
        text: 'Com uma mensagem que imita uma comunicação legítima de uma pessoa, empresa ou serviço conhecido.',
      },
      { id: 'b', text: 'Por um ataque direcionado a uma pessoa ou organização específica.' },
      {
        id: 'c',
        text: 'Via chamadas telefônicas, onde se passa por outra voz de um banco ou empresa.',
      },
      {
        id: 'd',
        text: 'Utilizando plataformas como Instagram, Facebook, X (anteriormente Twitter) e outras redes sociais para enganar os usuários.',
      },
      { id: 'e', text: 'Criando mensagens de texto, como SMS ou aplicativos de mensagens.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Vishing é o phishing por voz. As outras alternativas descrevem clone phishing, spear phishing, phishing em redes sociais e smishing, todos vistos no Módulo 2.',
  },
  {
    id: 'q2',
    type: 'multiple_answer',
    prompt: 'Engenharia social com uso de phishing, como pode ser melhor prevenida?',
    options: [
      { id: 'a', text: 'Atenção redobrada ao perfil do remetente ao receber e-mails.' },
      { id: 'b', text: 'Abrir qualquer anexo com confiança pode ser seguro.' },
      {
        id: 'c',
        text: 'Após algum colega de trabalho pedir a senha deve-se repassá-la sem preocupações.',
      },
      { id: 'd', text: 'Links podem ser maliciosos, então deve-se abri-los com cautela.' },
      {
        id: 'e',
        text: 'Muitas ferramentas de segurança podem auxiliar na invasão de qualquer sistema.',
      },
    ],
    correctOptionIds: ['a', 'd'],
    explanation:
      'Verificar o remetente e tratar links com cautela são as duas práticas corretas. Senha não se compartilha com ninguém, nem com colegas, e anexo inesperado nunca é seguro por padrão.',
  },
  {
    id: 'q3',
    type: 'scenario',
    scenario:
      '"Parabéns! Você recebeu um prêmio de R$ 500,00 na sua conta bancária, para poder recebê-lo, apenas confirme seu e-mail e senha utilizando este link: [premio.example/resgate]"',
    prompt: 'É uma mensagem de qual tipo de ataque de phishing?',
    options: [
      { id: 'a', text: 'Phishing em redes sociais.' },
      { id: 'b', text: 'Clone phishing.' },
      { id: 'c', text: 'Spear phishing.' },
      { id: 'd', text: 'Vishing.' },
      { id: 'e', text: 'Smishing.' },
    ],
    correctOptionId: 'b',
    explanation:
      'A mensagem imita uma comunicação de uma instituição conhecida para capturar credenciais, que é a definição de clone phishing. Não é direcionada a um alvo específico, o que a diferencia do spear phishing.',
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    prompt: 'O que caracteriza um deepfake?',
    options: [
      {
        id: 'a',
        text: 'Um vídeo ou imagem manipulada por IA para simular uma pessoa ou situação.',
      },
      { id: 'b', text: 'Um programa que identifica profundamente todos os golpes digitais.' },
      { id: 'c', text: 'Uma técnica de criptografia usada para proteger vídeos pessoais.' },
      { id: 'd', text: 'Um sistema que impede a criação de perfis falsos nas redes sociais.' },
      {
        id: 'e',
        text: 'Um método de autenticação que confirma a identidade por reconhecimento facial.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Deepfake combina deep learning e fake: é conteúdo gerado ou manipulado por IA para simular uma pessoa real, como visto no Módulo 3.',
  },
  {
    id: 'q5',
    type: 'scenario',
    scenario:
      'Você recebe um áudio estranho por um familiar pedindo uma transferência bancária urgente.',
    prompt: 'Qual seria a atitude mais segura diante desta possibilidade?',
    options: [
      { id: 'a', text: 'Realizar a transferência rapidamente.' },
      { id: 'b', text: 'Confiar no áudio caso a voz seja familiar.' },
      { id: 'c', text: 'Pedir que a pessoa envie outro áudio.' },
      {
        id: 'd',
        text: 'Compartilhar o áudio nas redes sociais para perguntar se é verdadeiro.',
      },
      { id: 'e', text: 'Confirmar o pedido com uma ligação para um número já conhecido.' },
    ],
    correctOptionId: 'e',
    explanation:
      'A voz clonada por IA é hoje uma das táticas mais comuns, então reconhecer a voz não prova identidade. Pedir outro áudio também não resolve, porque o golpista gera quantos quiser.',
  },
  {
    id: 'q6',
    type: 'multiple_answer',
    scenario:
      'Após utilizar as redes sociais por um tempo, você acaba se deparando com um curso sobre IA e como utilizá-la, vindo de uma fonte suspeita.',
    prompt: 'Quais serão suas ações?',
    options: [
      { id: 'a', text: 'Perguntar para alguém se já teriam completado o curso.' },
      { id: 'b', text: 'Ignorar e continuar rolando nas mídias.' },
      { id: 'c', text: 'Denunciar para as redes de contato corretas.' },
      { id: 'd', text: 'Não praticar nada ensinado.' },
      { id: 'e', text: 'Completar o curso e utilizar seus ensinamentos.' },
    ],
    correctOptionIds: ['c', 'd'],
    explanation:
      'Denunciar ajuda a derrubar o conteúdo e proteger outras pessoas, e não aplicar nada do que foi ensinado evita que você se torne parte do problema. Apenas ignorar deixa o conteúdo circulando.',
  },
  {
    id: 'q7',
    type: 'multiple_answer',
    scenario:
      'Após alguém proclamar ser o seu gerente bancário, possuindo mesmo ícone de perfil mas conversa de forma semelhante, você começa a questionar a identidade deste indivíduo.',
    prompt: 'Qual mensagem seria a melhor para questionar sua identidade?',
    options: [
      {
        id: 'a',
        text: '"Ah sim, já passarei a conta perdida do mês passado agora mesmo, pode deixar."',
      },
      {
        id: 'b',
        text: '"Qual é minha senha bancária cadastrada? Quero confirmar que você realmente é meu gerente."',
      },
      {
        id: 'c',
        text: '"Poderia confirmar sua identidade por meio de uma ligação para o número oficial da agência?"',
      },
      {
        id: 'd',
        text: '"Poderia me informar alguns dados pessoais da minha conta para comprovar sua identidade?"',
      },
      {
        id: 'e',
        text: '"Antes de prosseguir, poderia confirmar sua identidade por um canal oficial do banco?"',
      },
    ],
    correctOptionIds: ['c', 'e'],
    explanation:
      'As duas corretas mudam a verificação para um canal oficial, que é o que o golpista não controla. Pedir que ele cite sua senha ou seus dados é perigoso: além de não provar nada, sinaliza quais informações ele ainda não tem.',
  },
  {
    id: 'q8',
    type: 'multiple_answer',
    scenario:
      'Você recebeu um Pix de uma pessoa totalmente desconhecida. Minutos depois, essa mesma pessoa entrou em contato por mensagem dizendo que fez a transferência por engano e exigindo que devolva o dinheiro imediatamente para outra chave Pix.',
    prompt: 'O que fazer?',
    options: [
      {
        id: 'a',
        text: 'Falar com o suporte oficial do banco, para que o dinheiro volte direto para a mesma conta de origem com segurança.',
      },
      {
        id: 'b',
        text: 'Não fazer um Pix de volta, usando apenas o botão oficial de "Devolver Pix" dentro do aplicativo do banco.',
      },
      {
        id: 'c',
        text: 'Sacar o dinheiro em espécie em um caixa eletrônico e transferir para outra conta para se proteger de bloqueios bancários.',
      },
      { id: 'd', text: 'Gastar o dinheiro e bloquear a pessoa.' },
      { id: 'e', text: 'Fazer o Pix de volta para a chave que a pessoa enviou no chat.' },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Devolver para uma chave diferente da origem é exatamente o objetivo do golpe: o dinheiro original costuma ser de uma conta invadida, e quem devolve na chave nova fica no prejuízo e pode responder pela movimentação. A devolução precisa ir para a conta de origem, pelo canal oficial.',
  },
  {
    id: 'q9',
    type: 'scenario',
    scenario:
      'Complete as lacunas indicando o órgão ou canal responsável para realizar a denúncia ou registro de cada caso.\n\n(1) Se você sofreu um golpe financeiro via Pix, precisa imediatamente acionar o MED e relatar a fraude na instituição financeira, o primeiro canal a ser contatado é o ______.\n\n(2) Caso ocorra um crime cibernético, invasão de redes sociais ou vazamento de dados pessoais, o boletim de ocorrência deve ser registrado na ______.\n\n(3) Se você adquiriu um produto ou serviço em um site falso de comércio eletrônico e a empresa se recusa a devolver o valor ou prestar atendimento, a plataforma digital oficial para registrar a reclamação é o ______.',
    prompt: 'Qual sequência completa corretamente as lacunas?',
    options: [
      {
        id: 'a',
        text: '(1) Consumidor.gov.br · (2) Suporte do Banco ou Instituição Financeira · (3) Delegacia de Polícia (Civil ou Virtual)',
      },
      {
        id: 'b',
        text: '(1) Suporte do Banco ou Instituição Financeira · (2) Delegacia de Polícia (Civil ou Virtual) · (3) Consumidor.gov.br',
      },
      {
        id: 'c',
        text: '(1) Delegacia de Polícia (Civil ou Virtual) · (2) Consumidor.gov.br · (3) Suporte do Banco ou Instituição Financeira',
      },
      {
        id: 'd',
        text: '(1) Suporte do Banco ou Instituição Financeira · (2) Consumidor.gov.br · (3) Delegacia de Polícia (Civil ou Virtual)',
      },
      {
        id: 'e',
        text: '(1) Consumidor.gov.br · (2) Delegacia de Polícia (Civil ou Virtual) · (3) Suporte do Banco ou Instituição Financeira',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'A ordem segue a urgência de cada caso. O banco vem primeiro no golpe financeiro porque o MED só funciona enquanto houver saldo. A delegacia registra o crime. O Consumidor.gov.br media conflito com empresa que se recusa a resolver.',
  },
  {
    id: 'q10',
    type: 'multiple_answer',
    prompt: 'O que caracteriza o uso da inteligência artificial em ataques de engenharia social?',
    options: [
      {
        id: 'a',
        text: 'A criação de mensagens fraudulentas mais convincentes e personalizadas para enganar vítimas.',
      },
      {
        id: 'b',
        text: 'A eliminação completa da necessidade de interação humana em todos os golpes.',
      },
      {
        id: 'c',
        text: 'A impossibilidade de utilizar informações públicas para personalizar tentativas de fraude.',
      },
      {
        id: 'd',
        text: 'A garantia de que todos os golpes realizados com IA serão identificados automaticamente.',
      },
      {
        id: 'e',
        text: 'A geração de áudios e vídeos falsos para se passar por pessoas conhecidas ou autoridades.',
      },
    ],
    correctOptionIds: ['a', 'e'],
    explanation:
      'A IA aumenta o poder de convencimento e a escala, mas o ataque continua dependendo de manipular uma pessoa. Ela não elimina a interação humana nem torna os golpes mais fáceis de detectar.',
  },
]
