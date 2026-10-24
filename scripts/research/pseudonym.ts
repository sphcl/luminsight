import { createHmac } from 'node:crypto'

const ID_LENGTH = 12
const MIN_KEY_LENGTH = 32

// HMAC com chave secreta: sem a chave, ter a lista de uids não basta pra ligar um identificador a ninguém.
export function createPseudonymizer(key: string): (uid: string) => string {
  const trimmed = key.trim()
  if (trimmed.length < MIN_KEY_LENGTH) {
    throw new Error(
      `A chave da exportação precisa ter pelo menos ${MIN_KEY_LENGTH} caracteres (gere com openssl rand -hex 32).`
    )
  }
  return (uid) => createHmac('sha256', trimmed).update(uid).digest('hex').slice(0, ID_LENGTH)
}

// 48 bits quase nunca colidem com dezenas de pessoas, mas se colidir eu prefiro parar a misturar duas pessoas.
export function assignPseudonyms(
  uids: string[],
  pseudonymize: (uid: string) => string
): Map<string, string> {
  const byUid = new Map<string, string>()
  const seen = new Set<string>()
  for (const uid of uids) {
    const id = pseudonymize(uid)
    if (seen.has(id))
      throw new Error('Dois participantes caíram no mesmo identificador; exportação abortada.')
    seen.add(id)
    byUid.set(uid, id)
  }
  return byUid
}
