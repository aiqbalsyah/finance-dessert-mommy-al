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
import { useCreateSalary, useUpdateSalary } from "@/lib/api/salaries"
import { formatISO } from "@/lib/formatters"
import { salaryCreateSchema, type Salary } from "@/types/salaries"

interface GajiFormProps {
  salary?: Salary
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

function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function GajiForm({ salary, onSuccess, onCancel }: GajiFormProps) {
  const isEdit = Boolean(salary)
  const accountsQuery = useGetAccounts()
  const createMutation = useCreateSalary()
  const updateMutation = useUpdateSalary(salary?.id ?? "")
  const isPending = createMutation.isPending || updateMutation.isPending

  const accounts = accountsQuery.data ?? []
  const [paidDate, setPaidDate] = useState<string>(
    salary ? formatISO(salary.paidAt) : todayISO()
  )

  const form = useForm({
    defaultValues: {
      employeeName: salary?.employeeName ?? "",
      amount: salary?.amount ?? 0,
      accountId: salary?.accountId ?? "",
      paidAt: salary?.paidAt ?? dateStringToUnix(todayISO()),
      period: salary?.period ?? currentPeriod(),
      receiptUrl: salary?.receiptUrl,
      receiptPath: salary?.receiptPath,
      note: salary?.note ?? "",
    },
    validators: { onSubmit: salaryCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && salary) {
          await updateMutation.mutateAsync(value)
          toast.success("Pembayaran gaji berhasil diubah.")
        } else {
          await createMutation.mutateAsync(value)
          toast.success("Pembayaran gaji berhasil dicatat.")
        }
        onSuccess?.()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan."
        toast.error(message)
      }
    },
  })

  useEffect(() => {
    form.setFieldValue("paidAt", dateStringToUnix(paidDate))
  }, [paidDate, form])

  return (
    <form
      id="gaji-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="gaji-paidAt">Tanggal Pembayaran</FieldLabel>
          <Input
            id="gaji-paidAt"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            max={todayISO()}
          />
        </Field>

        <form.Field
          name="employeeName"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Nama Karyawan</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="contoh: Siti Aminah"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="period"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Periode</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="month"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  Periode gaji yang dibayarkan (bulan dan tahun).
                </FieldDescription>
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
                folder="salaries-receipts"
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
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Gaji"}
        </Button>
      </Field>
    </form>
  )
}
