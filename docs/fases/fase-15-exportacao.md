# Fase 15: exportação dos resultados

PR #21.

**O que foi feito**

- `npm run export:results`: lê o banco, só lendo, e grava sete CSV numa pasta fora do repositório.
- Identificador anônimo por HMAC com chave secreta, comentários num arquivo à parte e embaralhados,
  proteção contra fórmula de planilha em todo campo de texto.
- Resumo com as exclusões por categoria, a conferência de perda de dado, a divergência entre acerto
  gravado e recalculado e as métricas de cada medida com o tamanho da amostra.

**Por quê**

Uma página de administrador dentro do site exigiria criar papel privilegiado e uma superfície nova
de ataque. Um script de leitura na máquina de quem tem a credencial resolve sem isso. Os detalhes
estão em `docs/modelagem.md`, seção 4.
