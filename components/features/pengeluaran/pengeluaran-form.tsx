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
import { useCreateExpense, useUpdateExpense } from "@/lib/api/expenses"
import { formatISO } from "@/lib/formatters"
import {
  expenseCategoryLabels,
  expenseCreateSchema,
  type Expense,
  type ExpenseCategory,
} from "@/types/expenses"

interface PengeluaranFormProps {
  expense?: Expense
  onSuccess?: () => void
  onCancel?: () => void
}

const expenseCategories: ExpenseCategory[] = [
  "utilities",
  "rent",
  "transport",
  "supplies",
  "marketing",
  "other",
]

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

export function PengeluaranForm({ expense, onSuccess, onCancel }: PengeluaranFormProps) {
  const isEdit = Boolean(expense)
  const accountsQuery = useGetAccounts()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense(expense?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const accounts = accountsQuery.data ?? []
  const [spentDate, setSpentDate] = useState<string>(
    expense ? formatISO(expense.spentAt) : todayISO()
  )

  const form = useForm({
    defaultValues: {
      category: expense?.category ?? ("utilities" as ExpenseCategory),
      description: expense?.description ?? "",
      amount: expense?.amount ?? 0,
      accountId: expense?.accountId ?? "",
      spentAt: expense?.spentAt ?? dateStringToUnix(todayISO()),
      receiptUrl: expense?.receiptUrl,
      receiptPath: expense?.receiptPath,
      note: expense?.note ?? "",
    },
    validators: { onSubmit: expenseCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && expense) {
          await updateMutation.mutateAsync(value)
          toast.success("Pengeluaran berhasil diubah.")
        } else {
          await createMutation.mutateAsync(value)
          toast.success("Pengeluaran berhasil dicatat.")
        }
        onSuccess?.()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan."
        toast.error(message)
      }
    },
  })

  useEffect(() => {
    form.setFieldValue("spentAt", dateStringToUnix(spentDate))
  }, [spentDate, form])

  return (
    <form
      id="pengeluaran-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="pengeluaran-spentAt">Tanggal Pengeluaran</FieldLabel>
          <Input
            id="pengeluaran-spentAt"
            type="date"
            value={spentDate}
            onChange={(e) => setSpentDate(e.target.value)}
            max={todayISO()}
          />
        </Field>

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
                  onValueChange={(v) => field.handleChange((v ?? "utilities") as ExpenseCategory)}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {expenseCategoryLabels[cat]}
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
                  placeholder="contoh: Tagihan listrik bulan April"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
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
                folder="expenses-receipts"
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
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Pengeluaran"}
        </Button>
      </Field>
    </form>
  )
}
