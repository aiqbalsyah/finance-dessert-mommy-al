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
import { Switch } from "@/components/ui/switch"
import { useCreateProduct, useUpdateProduct } from "@/lib/api/products"
import {
  productCategoryLabels,
  productCreateSchema,
  type Product,
  type ProductCategory,
} from "@/types/products"

interface MasterProdukFormProps {
  product?: Product
  onSuccess?: () => void
  onCancel?: () => void
}

const productCategories: ProductCategory[] = ["cake", "cookie", "pastry", "drink", "other"]

export function MasterProdukForm({ product, onSuccess, onCancel }: MasterProdukFormProps) {
  const isEdit = Boolean(product)
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(product?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? ("cake" as ProductCategory),
      price: product?.price ?? 0,
      isActive: product?.isActive ?? true,
    },
    validators: { onSubmit: productCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && product) {
          await updateMutation.mutateAsync(value)
          toast.success("Produk berhasil diubah.")
        } else {
          await createMutation.mutateAsync(value)
          toast.success("Produk berhasil ditambahkan.")
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
      id="master-produk-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Nama Produk</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="contoh: Brownies Coklat"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="category"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Kategori</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as ProductCategory)}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {productCategoryLabels[cat]}
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
          name="price"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Harga (Rp)</FieldLabel>
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
                  placeholder="0"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="isActive"
          children={(field) => (
            <Field orientation="horizontal">
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel htmlFor={field.name}>Status Aktif</FieldLabel>
                <FieldDescription>
                  Produk yang tidak aktif tidak akan muncul saat input penjualan.
                </FieldDescription>
              </div>
              <Switch
                id={field.name}
                name={field.name}
                checked={field.state.value}
                onCheckedChange={field.handleChange}
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
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
      </Field>
    </form>
  )
}
