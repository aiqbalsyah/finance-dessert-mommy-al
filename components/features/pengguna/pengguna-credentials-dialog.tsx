"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Icon } from "@/components/shared/icon"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface PenggunaCredentialsDialogProps {
  open: boolean
  email: string
  password: string
  /** Heading text. Defaults to "Pengguna Berhasil Dibuat". */
  title?: string
  /** Body text shown above the credentials box. */
  description?: string
  onClose: () => void
}

export function PenggunaCredentialsDialog({
  open,
  email,
  password,
  title = "Pengguna Berhasil Dibuat",
  description = "Berikan kata sandi sementara ini ke pengguna. Mereka wajib mengubahnya saat login pertama.",
  onClose,
}: PenggunaCredentialsDialogProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success("Kata sandi disalin ke clipboard.")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Gagal menyalin. Salin manual dari kotak di atas.")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 rounded-card border border-border bg-muted p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="font-mono text-sm">{email}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Kata Sandi</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{password}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={handleCopy}
              >
                <Icon name={copied ? "check" : "content_copy"} size={14} />
                <span className="sr-only">Salin kata sandi</span>
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Kata sandi ini hanya ditampilkan sekali. Jika Anda menutup dialog ini tanpa menyalin,
          gunakan menu &quot;Reset Kata Sandi&quot; untuk membuat kata sandi baru.
        </p>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Tutup</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
