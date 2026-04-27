"use client"

import { useEffect, useMemo, useState } from "react"
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
import { useGetProducts } from "@/lib/api/products"
import { useCreateSale, useUpdateSale } from "@/lib/api/sales"
import { formatCurrency, formatISO } from "@/lib/formatters"
import { saleCreateSchema, type Sale } from "@/types/sales"

interface PenjualanFormProps {
  sale?: Sale
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

export function PenjualanForm({ sale, onSuccess, onCancel }: PenjualanFormProps) {
  const isEdit = Boolean(sale)
  const productsQuery = useGetProducts({ active: true })
  const accountsQuery = useGetAccounts()
  const createMutation = useCreateSale()
  const updateMutation = useUpdateSale(sale?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const products = productsQuery.data ?? []
  const accounts = accountsQuery.data ?? []

  const [soldDate, setSoldDate] = useState<string>(
    sale ? formatISO(sale.soldAt) : todayISO()
  )

  const form = useForm({
    defaultValues: {
      productId: sale?.productId ?? "",
      qty: sale?.qty ?? 1,
      unitPrice: sale?.unitPrice ?? 0,
      accountId: sale?.accountId ?? "",
      soldAt: sale?.soldAt ?? dateStringToUnix(todayISO()),
      receiptUrl: sale?.receiptUrl,
      receiptPath: sale?.receiptPath,
      note: sale?.note ?? "",
    },
    validators: { onSubmit: saleCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && sale) {
          await updateMutation.mutateAsync(value)
          toast.success("Penjualan berhasil diubah.")
        } else {
          await createMutation.mutateAsync(value)
          toast.success("Penjualan berhasil dicatat.")
        }
        onSuccess?.()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan."
        toast.error(message)
      }
    },
  })

  // Sync the date input string back to form's Unix timestamp.
  useEffect(() => {
    form.setFieldValue("soldAt", dateStringToUnix(soldDate))
  }, [soldDate, form])

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  return (
    <form
      id="penjualan-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="penjualan-soldAt">Tanggal Penjualan</FieldLabel>
          <Input
            id="penjualan-soldAt"
            type="date"
            value={soldDate}
            onChange={(e) => setSoldDate(e.target.value)}
            max={todayISO()}
          />
        </Field>

        <form.Field
          name="productId"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Produk</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) => {
                    const value = v ?? ""
                    field.handleChange(value)
                    const product = productMap.get(value)
                    if (product && (form.getFieldValue("unitPrice") === 0 || !isEdit)) {
                      form.setFieldValue("unitPrice", product.price)
                    }
                  }}
                  disabled={productsQuery.isLoading}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        productsQuery.isLoading ? "Memuat produk..." : "Pilih produk"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {products.length === 0 && !productsQuery.isLoading && (
                  <FieldDescription>
                    Belum ada produk aktif. Tambahkan produk di menu Master Produk terlebih dahulu.
                  </FieldDescription>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="qty"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Qty</FieldLabel>
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
            name="unitPrice"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Harga Satuan (Rp)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    inputMode="numeric"
                    min={0}
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
        </div>

        <form.Subscribe
          selector={(state) => [state.values.qty, state.values.unitPrice] as const}
          children={([qty, unitPrice]) => (
            <Field>
              <FieldLabel>Total</FieldLabel>
              <div className="rounded-md border border-border bg-muted px-3 py-2 text-base font-semibold tabular-nums">
                {formatCurrency((qty || 0) * (unitPrice || 0))}
              </div>
              <FieldDescription>Dihitung otomatis dari Qty × Harga Satuan.</FieldDescription>
            </Field>
          )}
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
                folder="sales-receipts"
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
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Penjualan"}
        </Button>
      </Field>
    </form>
  )
}
