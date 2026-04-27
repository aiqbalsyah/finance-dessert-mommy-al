"use client"

import { useRef } from "react"
import Image from "next/image"
import { toast } from "sonner"

import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useUploadReceipt, type UploadFolder } from "@/lib/api/uploads"
import { cn } from "@/lib/utils"

interface ReceiptUploadProps {
  value?: string
  onChange: (url: string | undefined, path: string | undefined) => void
  folder: UploadFolder
  disabled?: boolean
  className?: string
}

const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/heic"

export function ReceiptUpload({
  value,
  onChange,
  folder,
  disabled,
  className,
}: ReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadReceipt()
  const isPending = upload.isPending

  function openPicker() {
    inputRef.current?.click()
  }

  async function handleFile(file: File) {
    try {
      const result = await upload.mutateAsync({ file, folder })
      onChange(result.url, result.path)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengunggah berkas."
      toast.error(message)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) handleFile(file)
  }

  function handleRemove() {
    onChange(undefined, undefined)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={handleChange}
        disabled={disabled || isPending}
      />

      {value ? (
        <div className="flex items-start gap-3 rounded-card border border-border p-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-action bg-muted">
            <Image
              src={value}
              alt="Bukti yang diunggah"
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-xs text-muted-foreground">Bukti telah diunggah.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPicker}
                disabled={disabled || isPending}
              >
                <Icon name="autorenew" size={14} />
                Ganti
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isPending}
                className="text-destructive hover:text-destructive"
              >
                <Icon name="close" size={14} />
                Hapus
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                render={<a href={value} target="_blank" rel="noreferrer noopener" />}
                nativeButton={false}
              >
                <Icon name="open_in_new" size={14} />
                Lihat
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || isPending}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border p-6 text-center transition-colors",
            "hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isPending ? (
            <>
              <Spinner className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Mengunggah...</span>
            </>
          ) : (
            <>
              <Icon name="upload" size={24} className="text-muted-foreground" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-medium">Unggah Bukti</span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP, atau HEIC. Maks 5 MB.
                </span>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  )
}
