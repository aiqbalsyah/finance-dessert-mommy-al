"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateUser, useUpdateUser } from "@/lib/api/users"
import {
  userRoleLabels,
  type CreateUserPayload,
  type User,
  type UserRole,
  type UserStatus,
} from "@/types/users"

const baseFormSchema = z.object({
  email: z.email("Format email tidak valid."),
  displayName: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  password: z.string(),
  role: z.enum(["admin", "manager", "kasir", "viewer"]),
  status: z.enum(["active", "disabled"]),
})

const formCreateSchema = baseFormSchema.extend({
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(64, "Kata sandi maksimal 64 karakter."),
})

const formEditSchema = baseFormSchema

interface PenggunaFormProps {
  user?: User
  onCreated?: (user: User, tempPassword: string) => void
  onUpdated?: () => void
  onCancel?: () => void
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$"

function generatePassword(length = 12): string {
  let result = ""
  const arr = new Uint8Array(length)
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < length; i++) result += ALPHABET[arr[i] % ALPHABET.length]
  return result
}

const roles: UserRole[] = ["admin", "manager", "kasir", "viewer"]

export function PenggunaForm({ user, onCreated, onUpdated, onCancel }: PenggunaFormProps) {
  const isEdit = Boolean(user)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser(user?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const [autoPassword, setAutoPassword] = useState(true)

  const form = useForm({
    defaultValues: {
      email: user?.email ?? "",
      displayName: user?.displayName ?? "",
      password: isEdit ? "" : generatePassword(),
      role: user?.role ?? ("kasir" as UserRole),
      status: user?.status ?? ("active" as UserStatus),
    },
    validators: { onSubmit: isEdit ? formEditSchema : formCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && user) {
          await updateMutation.mutateAsync({
            displayName: value.displayName,
            role: value.role,
            status: value.status,
          })
          toast.success("Pengguna berhasil diubah.")
          onUpdated?.()
        } else {
          const created = await createMutation.mutateAsync(value as CreateUserPayload)
          onCreated?.(created, value.password)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan."
        toast.error(message)
      }
    },
  })

  function regeneratePassword() {
    form.setFieldValue("password", generatePassword())
  }

  return (
    <form
      id="pengguna-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="nama@contoh.com"
                  disabled={isEdit}
                  autoComplete="off"
                />
                {isEdit && (
                  <FieldDescription>
                    Email tidak dapat diubah setelah akun dibuat.
                  </FieldDescription>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="displayName"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Nama lengkap"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        {!isEdit && (
          <form.Field
            name="password"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Kata Sandi Sementara</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        setAutoPassword(false)
                      }}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={regeneratePassword}
                      title="Generate ulang"
                    >
                      <Icon name="refresh" size={16} />
                      <span className="sr-only">Generate ulang</span>
                    </Button>
                  </div>
                  <FieldDescription>
                    {autoPassword
                      ? "Kata sandi dihasilkan otomatis. Pengguna wajib mengubahnya saat login pertama."
                      : "Kata sandi minimal 8 karakter. Pengguna wajib mengubahnya saat login pertama."}
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        )}

        <form.Field
          name="role"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange((v ?? "kasir") as UserRole)}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {userRoleLabels[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="status"
          children={(field) => (
            <Field orientation="horizontal">
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel htmlFor={field.name}>Akun Aktif</FieldLabel>
                <FieldDescription>
                  Akun nonaktif tidak dapat masuk ke sistem.
                </FieldDescription>
              </div>
              <Switch
                id={field.name}
                name={field.name}
                checked={field.state.value === "active"}
                onCheckedChange={(checked) => field.handleChange(checked ? "active" : "disabled")}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
        </Button>
      </Field>
    </form>
  )
}
