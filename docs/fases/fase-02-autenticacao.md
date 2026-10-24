# Fase 2: autenticação e autorização

PR #2 (01/09/2026).

**O que foi feito**

- Cadastro e login com e-mail e senha e com conta Google (`src/services/auth.service.ts`).
- Provedor de sessão que acompanha o estado do Firebase Auth e carrega o documento do usuário
  (`src/features/auth/AuthProvider.tsx`).
- Validação dos formulários com Zod e mensagens de erro que não revelam se o e-mail existe.
- Primeira versão do `firestore.rules`, com o documento do usuário restrito ao dono e `role: 'user'`
  para todo mundo.

**Por quê**

Autenticação delegada ao Firebase evita guardar e validar senha no código do projeto. A mesma
mensagem para "usuário não existe" e "senha errada" impede descobrir quais e-mails têm conta. Não
existir papel de administrador elimina uma superfície privilegiada inteira.
