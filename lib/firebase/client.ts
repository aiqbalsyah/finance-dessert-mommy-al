/**
 * Firebase Web SDK client init.
 *
 * Used ONLY in client components for sign-in/out flows.
 * Server-side code uses `lib/firebase/admin.ts` (Admin SDK).
 *
 * NOTE: This file deliberately does NOT have `import "server-only"` —
 * it's the one Firebase file that's safe (and required) on the client.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function getFirebaseClientApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  return initializeApp(firebaseConfig)
}

export function getFirebaseAuthClient(): Auth {
  return getAuth(getFirebaseClientApp())
}
