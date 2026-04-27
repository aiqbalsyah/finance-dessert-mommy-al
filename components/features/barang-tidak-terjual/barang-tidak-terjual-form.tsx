"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

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
import { useGetProducts } from "@/lib/api/products"
import { useCreateUnsoldItem, useUpdateUnsoldItem } from "@/lib/api/unsold-items"
import {
  unsoldItemCreateSchema,
  unsoldReasonLabels,
  type UnsoldItem,
  type UnsoldReason,
} from "@/types/unsold-items"

interface BarangTidakTerjualFormProps {
  item?: UnsoldItem
  onSuccess?: () => void
  onCancel?: () => void
}

const reasons: UnsoldReason[] = ["expired", "damaged", "leftover", "other"]

function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function BarangTidakTerjualForm({ item, onSuccess, onCancel }: BarangTidakTerjualFormProps) {
  const isEdit = Boolean(item)
  const productsQuery = useGetProducts({ active: true })
  const createMutation = useCreateUnsoldItem()
  const updateMutation = useUpdateUnsoldItem(item?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const products = productsQuery.data ?? []

  const form = useForm({
    defaultValues: {
      productId: item?.productId ?? "",
      qty: item?.qty ?? 1,
      date: item?.date ?? todayISO(),
      reason: item?.reason,
      note: item?.note ?? "",
    },
    validators: { onSubmit: unsoldItemCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && item) {
          await updateMutation.mutateAsync(value)
          toast.success("Catatan berhasil diubah.")
        } else {
          await createMutation.mutateAsync(value)
          toast.success("Catatan berhasil disimpan.")
        }
        onSuccess?.()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan."
        toast.error(message)
      }
    },
  })

  return (
    <form
      id="barang-tidak-terjual-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="date"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Tanggal</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  max={todayISO()}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

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
                  onValueChange={(v) => field.handleChange(v ?? "")}
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

        <form.Field
          name="qty"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Jumlah</FieldLabel>
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
          name="reason"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Alasan (opsional)</FieldLabel>
              <Select
                name={field.name}
                value={field.state.value ?? ""}
                onValueChange={(v) => field.handleChange((v || undefined) as UnsoldReason | undefined)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Pilih alasan" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {unsoldReasonLabels[reason]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
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
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Catatan"}
        </Button>
      </Field>
    </form>
  )
}
