# LumInsight

Site interativo de sensibilização sobre golpes digitais com IA e Engenharia Social.

## Sobre o projeto

O LumInsight é uma plataforma educacional gamificada que ensina usuários a identificar e evitar golpes digitais envolvendo Inteligência Artificial e Engenharia Social. Desenvolvido como Trabalho de Conclusão de Curso em Segurança da Informação — Fatec São Caetano do Sul.

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

## Variáveis de ambiente

Veja o arquivo `.env.example` para as variáveis necessárias.

## Autores

- Eduarda Marques Silva
- Igor Santana Rosa
- Jamily Vitoria de Freitas Lima
- Murillo Sansão Pardal
- Sophia Cardoso de Lima

**Orientadora:** Dra. Eliane Veiga Porta