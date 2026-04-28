"use client"

import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useChangePassword } from "@/lib/api/auth"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Kata sandi baru minimal 8 karakter.")
      .max(64, "Kata sandi baru maksimal 64 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi tidak cocok dengan kata sandi baru.",
    path: ["confirmPassword"],
  })

interface UbahKataSandiDialogProps {
  open: boolean
  forced?: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UbahKataSandiDialog({
  open,
  forced = false,
  onOpenChange,
  onSuccess,
}: UbahKataSandiDialogProps) {
  const changePassword = useChangePassword()

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await changePassword.mutateAsync({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        })
        toast.success("Kata sandi berhasil diubah.")
        onSuccess?.()
        onOpenChange(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal mengubah kata sandi."
        toast.error(message)
      }
    },
  })

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={(o) => (forced ? undefined : onOpenChange(o))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Kata Sandi</DialogTitle>
          <DialogDescription>
            Masukkan kata sandi saat ini dan kata sandi baru Anda.
          </DialogDescription>
        </DialogHeader>

        {forced && (
          <Alert>
            <AlertTitle>Wajib mengubah kata sandi</AlertTitle>
            <AlertDescription>
              Anda harus mengubah kata sandi sebelum melanjutkan menggunakan aplikasi.
            </AlertDescription>
          </Alert>
        )}

        <form
          id="ubah-kata-sandi-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="currentPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Kata Sandi Saat Ini</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="current-password"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />

            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Kata Sandi Baru</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Konfirmasi Kata Sandi Baru</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <Field orientation="horizontal" className="mt-6 justify-end">
            {!forced && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={changePassword.isPending}
              >
                Batal
              </Button>
            )}
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Menyimpan..." : "Simpan Kata Sandi"}
            </Button>
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  )
}
