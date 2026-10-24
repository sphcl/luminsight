import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { app, usesEmulators } from './app'

export const auth = getAuth(app)

if (usesEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}
