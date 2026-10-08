import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { parseSimulation } from '@/utils/security/firestore-validators'
import type { SimulationDocument } from '@/types/simulation.types'

const SIMULATIONS_COLLECTION = 'simulations'

export async function getSimulations(): Promise<SimulationDocument[]> {
  const snapshot = await getDocs(collection(db, SIMULATIONS_COLLECTION))

  return snapshot.docs.flatMap((docSnapshot) => {
    const parsed = parseSimulation(docSnapshot.data())
    return parsed ? [{ ...parsed, id: docSnapshot.id }] : []
  })
}

export async function getSimulationById(simulationId: string): Promise<SimulationDocument | null> {
  const snapshot = await getDoc(doc(db, SIMULATIONS_COLLECTION, simulationId))
  if (!snapshot.exists()) return null

  const parsed = parseSimulation(snapshot.data())
  return parsed ? { ...parsed, id: snapshot.id } : null
}
