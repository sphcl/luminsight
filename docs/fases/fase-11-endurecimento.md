# Fase 11: endurecimento de segurança

PR #13, commit `016434f` (18/10/2026).

**O que foi feito**

- Auditoria das Firestore Rules: lista fechada de campos, datas do servidor, progresso que só anda
  para frente e resultados imutáveis.
- Testes das rules contra o emulador, um por tentativa de ataque (`tests/rules/`).
- Cabeçalhos HTTP de segurança e CSP no `firebase.json`.
- Auditoria de dependências no CI (`scripts/audit-check.ts`), com lista explícita de riscos aceitos.
- `docs/seguranca.md`, com o modelo de ameaça e o mapeamento para o OWASP Top 10.

**Por quê**

Sem servidor próprio, as rules são a única barreira que vale. A auditoria encontrou falhas reais,
como resultado de quiz que só conferia o dono e progresso que aceitava qualquer módulo, listadas em
`docs/seguranca.md`, seção 2.8.
