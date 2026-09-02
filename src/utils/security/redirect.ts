// Nome do query param usado por ProtectedRoute/OnboardingRoute para lembrar
// de onde o usuário veio, e por PublicOnlyRoute/Login/Register para voltar
// pra lá depois de autenticar. Centralizado aqui pra quem lê e quem escreve
// o param usar sempre a mesma chave.
export const REDIRECT_QUERY_PARAM = 'redirect'

// Valida que um valor vindo de query string é um caminho interno seguro para
// usar em <Navigate>/navigate(). Isso é a defesa contra open redirect: sem
// essa checagem, um link como "/login?redirect=https://site-malicioso.com"
// faria o app redirecionar o usuário logado para fora do domínio.
export function getSafeRedirectPath(value: string | null): string | null {
  if (!value) {
    return null
  }

  // Precisa ser um caminho raiz-relativo. Bloqueia URLs absolutas
  // ("https://evil.com") e esquemas arbitrários ("javascript:alert(1)").
  if (!value.startsWith('/')) {
    return null
  }

  // "//evil.com" é uma URL protocol-relative: o navegador troca de host
  // mantendo o protocolo atual. "/\evil.com" é o mesmo truque com barra
  // invertida — alguns navegadores normalizam "\" para "/" na hora de
  // resolver a URL, transformando isso em "//evil.com" por baixo dos panos.
  if (value.startsWith('//') || value.startsWith('/\\')) {
    return null
  }

  // Barra final de segurança: nenhum "esquema://" pode aparecer em nenhum
  // ponto do caminho, mesmo depois dos checks acima.
  if (value.includes('://')) {
    return null
  }

  return value
}
