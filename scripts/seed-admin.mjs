#!/usr/bin/env node
/**
 * Seed the first admin user (run once after auth-and-rbac Phase 02).
 *
 * Usage:
 *   pnpm seed:admin
 *
 * The script reads Firebase Admin credentials from .env.local, prompts
 * interactively for the admin's email + name + password, then creates:
 *   1. Firebase Auth user (email + password)
 *   2. Firestore users/{uid} profile (role: admin, status: active, mustChangePassword: false)
 *
 * If the Firebase Auth user already exists for that email, the script
 * reuses the existing UID and just creates/updates the Firestore profile.
 */

import { readFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { FieldValue, getFirestore } from "firebase-admin/firestore"

function loadEnvLocal() {
  const env = {}
  let raw
  try {
    raw = readFileSync(".env.local", "utf-8")
  } catch {
    console.error("❌ .env.local not found. Run from the project root.")
    process.exit(1)
  }

  // Simple parser: KEY=VALUE per line, supports double-quoted values.
  // Stops at first unquoted '#' for comments.
  let key = null
  let buf = ""
  let inQuote = false
  for (const line of raw.split("\n")) {
    if (!key) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = line.indexOf("=")
      if (eq < 0) continue
      key = line.slice(0, eq).trim()
      let value = line.slice(eq + 1)
      if (value.startsWith('"')) {
        value = value.slice(1)
        inQuote = true
        if (value.endsWith('"') && !value.endsWith('\\"')) {
          env[key] = value.slice(0, -1)
          key = null
          buf = ""
          inQuote = false
          continue
        }
        buf = value
      } else {
        const hash = value.indexOf("#")
        env[key] = (hash >= 0 ? value.slice(0, hash) : value).trim()
        key = null
      }
    } else if (inQuote) {
      buf += "\n" + line
      if (line.endsWith('"')) {
        env[key] = buf.slice(0, -1)
        key = null
        buf = ""
        inQuote = false
      }
    }
  }
  return env
}

function initAdmin(env) {
  const projectId = env.FIREBASE_PROJECT_ID
  const clientEmail = env.FIREBASE_CLIENT_EMAIL
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing Firebase Admin credentials in .env.local")
    console.error("   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY")
    process.exit(1)
  }

  if (!getApps().length) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  }
}

async function prompt(rl, label) {
  const value = (await rl.question(label)).trim()
  return value
}

async function main() {
  const env = loadEnvLocal()
  initAdmin(env)

  const rl = createInterface({ input: stdin, output: stdout })
  console.log("== Seed Admin User ==\n")

  const email = await prompt(rl, "Email: ")
  const displayName = await prompt(rl, "Nama lengkap: ")
  const password = await prompt(rl, "Kata sandi (min 8 karakter): ")
  rl.close()

  if (!email.includes("@")) {
    console.error("❌ Email tidak valid.")
    process.exit(1)
  }
  if (displayName.length < 2) {
    console.error("❌ Nama minimal 2 karakter.")
    process.exit(1)
  }
  if (password.length < 8) {
    console.error("❌ Kata sandi minimal 8 karakter.")
    process.exit(1)
  }

  const auth = getAuth()
  const db = getFirestore()
  db.settings({ ignoreUndefinedProperties: true })

  let uid
  let createdInAuth = false
  try {
    const user = await auth.createUser({ email, password, displayName, disabled: false })
    uid = user.uid
    createdInAuth = true
    console.log(`\n✅ Firebase Auth user dibuat: ${uid}`)
  } catch (err) {
    if (err && err.code === "auth/email-already-exists") {
      const existing = await auth.getUserByEmail(email)
      uid = existing.uid
      // Update displayName + password to the new values so the prompt is authoritative.
      await auth.updateUser(uid, { displayName, password, disabled: false })
      console.log(`\nℹ️  User sudah ada di Firebase Auth, password & nama diperbarui: ${uid}`)
    } else {
      throw err
    }
  }

  const now = FieldValue.serverTimestamp()
  await db.collection("users").doc(uid).set({
    email,
    displayName,
    role: "admin",
    status: "active",
    mustChangePassword: false,
    createdAt: now,
    updatedAt: now,
  }, { merge: true })

  console.log(`✅ Firestore profile users/${uid} dibuat`)
  console.log("\n🎉 Selesai. Anda dapat login di /auth/login dengan email + kata sandi tersebut.\n")

  if (!createdInAuth) {
    console.log("Catatan: kata sandi user ini diganti oleh script. Jika sebelumnya")
    console.log("sudah punya kata sandi sendiri, gunakan yang baru ini.\n")
  }
}

main().catch((err) => {
  console.error("\n❌ Gagal seed admin:", err.message ?? err)
  process.exit(1)
})
