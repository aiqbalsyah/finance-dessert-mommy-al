"use client"

import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { ReceiptUpload } from "@/components/shared/receipt-upload"
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
import { Textarea } from "@/components/ui/textarea"
import { useGetAccounts } from "@/lib/api/accounts"
import { useCreatePurchase, useUpdatePurchase } from "@/lib/api/purchases"
import { formatISO } from "@/lib/formatters"
import { purchaseCreateSchema, type Purchase } from "@/types/purchases"

interface BahanFormProps {
  purchase?: Purchase
  onSuccess?: () => void
  onCancel?: () => void
}

function dateStringToUnix(dateStr: string): number {
  return Math.floor(new Date(`${dateStr}T00:00:00`).getTime() / 1000)
}

function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function BahanForm({ purchase, onSuccess, onCancel }: BahanFormProps) {
  const isEdit = Boolean(purchase)
  const accountsQuery = useGetAccounts()
  const createMutation = useCreatePurchase()
  const updateMutation = useUpdatePurchase(purchase?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const accounts = accountsQuery.data ?? []
  const [purchasedDate, setPurchasedDate] = useState<string>(
    purchase ? formatISO(purchase.purchasedAt) : todayISO()
  )

  const form = useForm({
    defaultValues: {
      description: purchase?.description ?? "",
      amount: purchase?.amount ?? 0,
      accountId: purchase?.accountId ?? "",
      purchasedAt: purchase?.purchasedAt ?? dateStringToUnix(todayISO()),
      vendor: purchase?.vendor ?? "",
      receiptUrl: purchase?.receiptUrl,
      receiptPath: purchase?.receiptPath,
      note: purchase?.note ?? "",
    },
    validators: { onSubmit: purchaseCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && purchase) {
          await updateMutation.mutateAsync(value)
          toast.success("Pembelian berhasil diubah.")
        } else {
          await createMutation.mutateAsync(value)
          toast.success("Pembelian berhasil dicatat.")
        }
        onSuccess?.()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan."
        toast.error(message)
      }
    },
  })

  useEffect(() => {
    form.setFieldValue("purchasedAt", dateStringToUnix(purchasedDate))
  }, [purchasedDate, form])

  return (
    <form
      id="bahan-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="bahan-purchasedAt">Tanggal Pembelian</FieldLabel>
          <Input
            id="bahan-purchasedAt"
            type="date"
            value={purchasedDate}
            onChange={(e) => setPurchasedDate(e.target.value)}
            max={todayISO()}
          />
        </Field>

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="contoh: Tepung terigu 25kg"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="vendor"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Vendor (opsional)</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="contoh: Toko Bahan Kue Sejahtera"
                autoComplete="off"
              />
            </Field>
          )}
        />

        <form.Field
          name="amount"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Jumlah (Rp)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="accountId"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Rekening</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v ?? "")}
                  disabled={accountsQuery.isLoading}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        accountsQuery.isLoading ? "Memuat rekening..." : "Pilih rekening"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                        {account.code ? ` (${account.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accounts.length === 0 && !accountsQuery.isLoading && (
                  <FieldDescription>
                    Belum ada rekening. Tambahkan rekening di menu Rekening terlebih dahulu.
                  </FieldDescription>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="note"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Catatan (opsional)</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
                placeholder="Tambahkan catatan jika perlu..."
                maxLength={500}
              />
            </Field>
          )}
        />

        <Field>
          <FieldLabel>Bukti (opsional)</FieldLabel>
          <form.Subscribe
            selector={(state) => state.values.receiptUrl}
            children={(receiptUrl) => (
              <ReceiptUpload
                value={receiptUrl}
                folder="purchases-receipts"
                onChange={(url, path) => {
                  form.setFieldValue("receiptUrl", url)
                  form.setFieldValue("receiptPath", path)
                }}
                disabled={isPending}
              />
            )}
          />
        </Field>
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Pembelian"}
        </Button>
      </Field>
    </form>
  )
}
