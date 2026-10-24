import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { app, usesEmulators } from './app'

export const db = getFirestore(app)

if (usesEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
