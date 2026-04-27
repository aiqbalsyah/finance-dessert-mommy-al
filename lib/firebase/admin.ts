import "server-only"

import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getStorage, type Storage } from "firebase-admin/storage"

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local."
    )
  }

  return { projectId, clientEmail, privateKey }
}

export function getFirebaseApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  return initializeApp({
    credential: cert(getServiceAccount()),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

let cachedDb: Firestore | null = null

export function getDb(): Firestore {
  if (cachedDb) return cachedDb
  cachedDb = getFirestore(getFirebaseApp())
  // Skip undefined fields instead of throwing — needed for optional fields
  // like receiptUrl, vendor, note across transaction collections.
  cachedDb.settings({ ignoreUndefinedProperties: true })
  return cachedDb
}

export function getStorageInstance(): Storage {
  return getStorage(getFirebaseApp())
}

export function getDefaultBucket() {
  return getStorageInstance().bucket()
}
