# LumInsight

Site interativo de sensibilização sobre golpes digitais com IA e Engenharia Social.

## Sobre o projeto

O LumInsight é uma plataforma educacional gamificada que ensina usuários a identificar e evitar golpes digitais envolvendo Inteligência Artificial e Engenharia Social. Desenvolvido como Trabalho de Conclusão de Curso em Segurança da Informação, Fatec São Caetano do Sul.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Estado global:** Zustand
- **Validação:** Zod
- **Backend/Auth/DB:** Firebase (Auth + Firestore + Hosting)
- **Testes:** Vitest + React Testing Library
- **CI/CD:** GitHub Actions

## Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/luminsight.git
cd luminsight

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha o .env com as chaves do Firebase

# Rode o projeto
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificação de lint |
| `npm run type-check` | Verificação de tipos |
| `npm run test` | Testes em modo watch |
| `npm run test:run` | Testes uma única vez |
| `npm run test:coverage` | Cobertura de testes |
| `npm run seed` | Popula o Firestore com o conteúdo de `src/content/` (ver "Seed do Firestore") |

## Variáveis de ambiente

Veja o arquivo `.env.example` para as variáveis necessárias.

## Seed do Firestore

Os módulos e lições ficam no Firestore (não no bundle) para poderem ser atualizados sem um novo deploy. `npm run seed` popula essas coleções a partir do conteúdo em `src/content/`, usando o **Firebase Admin SDK** (que ignora as `firestore.rules` publicadas), então precisa de uma credencial de administrador do projeto, não das chaves do `.env`.

**Como gerar a credencial:**

1. No [Console do Firebase](https://console.firebase.google.com/), abra o projeto do LumInsight.
2. Vá em **Configurações do projeto → Contas de serviço**.
3. Clique em **Gerar nova chave privada**. Isso baixa um `.json` com a credencial de admin.
4. Salve esse arquivo na raiz do projeto como `firebase-service-account.json` (esse nome já está no `.gitignore`, **nunca** commite esse arquivo, ele dá acesso total de leitura/escrita ao banco).

Se preferir salvar em outro caminho, aponte para ele com a variável de ambiente `FIREBASE_SERVICE_ACCOUNT_PATH`:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/caminho/para/credencial.json npm run seed
```

O script se recusa a popular um módulo cujo conteúdo em `src/content/` ainda esteja com os placeholders vazios (`title: ''`), para não publicar algo incompleto na trilha por engano.

**Importante:** o conteúdo do quiz (perguntas, alternativas e gabarito) **não** faz parte do seed, ele nunca vai para o Firestore. Fica em `src/content/quizzes/`, direto no bundle do app. Isso evita que qualquer usuário autenticado consulte a coleção pelo console do navegador e veja as respostas corretas antes de responder. É uma mitigação parcial, não uma proteção completa: quem inspecionar o bundle JS ainda consegue ler as perguntas e o gabarito, só não existe um endpoint estruturado servindo isso.

## Autores

- Eduarda Marques Silva
- Igor Santana Rosa
- Jamily Vitoria de Freitas Lima
- Murillo Sansão Pardal
- Sophia Cardoso de Lima

**Orientadora:** Dra. Eliane Veiga Porta