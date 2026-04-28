import { cookies } from "next/headers"

import { usersRepository } from "@/lib/repositories/users"
import { verifyIdToken } from "@/lib/services/auth"

interface LoginBody {
  idToken: string
}

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7

export async function POST(request: Request) {
  let idToken: string
  try {
    const body = (await request.json()) as LoginBody
    idToken = body.idToken
    if (!idToken) {
      return Response.json({ error: "ID token wajib disertakan." }, { status: 400 })
    }
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 })
  }

  let uid: string
  try {
    const decoded = await verifyIdToken(idToken)
    uid = decoded.uid
  } catch {
    return Response.json({ error: "Token tidak valid atau sudah kedaluwarsa." }, { status: 401 })
  }

  const profile = await usersRepository.findById(uid)
  if (!profile) {
    return Response.json(
      { error: "Akun belum terdaftar di sistem. Hubungi administrator." },
      { status: 403 }
    )
  }
  if (profile.status === "disabled") {
    return Response.json(
      { error: "Akun Anda telah dinonaktifkan. Hubungi administrator." },
      { status: 403 }
    )
  }

  const cookieStore = await cookies()
  cookieStore.set("auth-token", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  })

  return Response.json({ user: profile })
}
