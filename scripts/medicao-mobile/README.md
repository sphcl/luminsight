# Medição de largura em 390 px

Confere, num iPhone emulado de 390 px de largura, se alguma tela do site fica mais larga que a tela
do aparelho. É a verificação que pegou o estouro de largura descrito em `docs/usabilidade.md`.

**Asserção central:** em todas as telas medidas, nas duas fontes (padrão e máxima), o
`document.documentElement.scrollWidth` tem que ser igual à largura da viewport. Qualquer diferença
significa rolagem horizontal no celular. O script imprime uma linha por tela e sai com código 1 se
alguma estourar.

É verificação manual, não roda no CI: precisa do Chrome instalado na máquina e dos emuladores do
Firebase rodando.

## O que mede

Landing, login, cadastro, dashboard, trilha, módulo, lição, lista de simulações, perfil, quiz final
e as três simulações (introdução e em andamento), primeiro com a fonte padrão e depois com a máxima.
Nada disso toca no banco de verdade: o app roda contra os emuladores, no projeto `demo-luminsight`,
que o SDK do Firebase só aceita contra emulador.

## Como rodar

São três terminais, todos na raiz do repositório.

1. Emuladores:

   ```bash
   npx --yes firebase-tools@15.33.0 emulators:start --only auth,firestore --project demo-luminsight
   ```

2. Conteúdo e conta de teste no emulador, depois o app apontando para ele:

   ```bash
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm run mobile:seed
   VITE_USE_EMULATORS=true npm run dev
   ```

3. Medição:

   ```bash
   npm run mobile:measure
   ```

Opções: `MEDICAO_URL` troca o endereço do app (padrão `http://localhost:5173`) e
`npm run mobile:measure -- --prints=/caminho/da/pasta` salva um print de cada tela.

`VITE_USE_EMULATORS` só tem efeito em `npm run dev`. No build de produção o trecho que liga os
emuladores não existe (`src/lib/firebase/app.ts`).
