"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useForgotPassword, useLogin } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const login = useLogin()
  const forgotPassword = useForgotPassword()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate(
      { email, password },
      { onSuccess: () => router.push("/dashboard") },
    )
  }

  function handleForgotPassword() {
    const target = email.trim() || window.prompt("Masukkan email akun Anda:")?.trim()
    if (!target) return
    forgotPassword.mutate(target, {
      onSuccess: () => {
        toast.success(`Tautan reset kata sandi telah dikirim ke ${target}.`)
      },
    })
  }

  return (
    <div className={cn("flex flex-col gap-4 md:gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg md:text-xl">Selamat Datang</CardTitle>
          <CardDescription>
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotPassword.isPending}
                    className="ml-auto text-sm underline-offset-4 hover:underline disabled:opacity-60"
                  >
                    {forgotPassword.isPending ? "Mengirim..." : "Lupa kata sandi?"}
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={login.isPending}>
                  {login.isPending ? "Memproses..." : "Masuk"}
                </Button>
                {login.isError && (
                  <p className="text-sm text-destructive text-center">
                    {login.error instanceof Error ? login.error.message : "Gagal masuk. Silakan coba lagi."}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
