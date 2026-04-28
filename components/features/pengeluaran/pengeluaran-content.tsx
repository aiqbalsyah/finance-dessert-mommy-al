"use client"

import { useState } from "react"
import { toast } from "sonner"

import { DashboardHeader } from "@/components/layouts/dashboard/dashboard-header"
import { PageHeader } from "@/components/layouts/dashboard/page-header"
import { Icon } from "@/components/shared/icon"
import { PermissionGuard } from "@/components/shared/permission-guard"
import { StateCard } from "@/components/shared/state-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGetAccounts } from "@/lib/api/accounts"
import { useDeleteExpense, useGetExpenses } from "@/lib/api/expenses"
import type { Expense } from "@/types/expenses"

import { PengeluaranForm } from "./pengeluaran-form"
import { PengeluaranSkeleton } from "./pengeluaran-skeleton"
import { PengeluaranTable } from "./pengeluaran-table"

export function PengeluaranContent() {
  const expensesQuery = useGetExpenses()
  const accountsQuery = useGetAccounts()
  const deleteMutation = useDeleteExpense()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | undefined>(undefined)
  const [deleting, setDeleting] = useState<Expense | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(expense: Expense) {
    setEditing(expense)
    setFormOpen(true)
  }

  function handleDelete(expense: Expense) {
    setDeleting(expense)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Pengeluaran berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pengeluaran."
      toast.error(message)
    }
  }

  const isLoading = expensesQuery.isLoading || accountsQuery.isLoading
  const isError = expensesQuery.isError

  return (
    <>
      <DashboardHeader title="Pengeluaran" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Pengeluaran"
          description="Catat pengeluaran lain-lain (utilitas, sewa, transportasi, dll)."
          showBack={false}
          action={
            <PermissionGuard permission="expenses:create">
              <Button onClick={handleAdd}>
                <Icon name="add" size={16} />
                Tambah Pengeluaran
              </Button>
            </PermissionGuard>
          }
        />

        {isLoading ? (
          <PengeluaranSkeleton />
        ) : isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat pengeluaran"
            description="Terjadi kesalahan saat memuat daftar pengeluaran."
            action={
              <Button variant="outline" size="sm" onClick={() => expensesQuery.refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <PengeluaranTable
            data={expensesQuery.data ?? []}
            accounts={accountsQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data pengeluaran."
                : "Catat pengeluaran lain-lain baru."}
            </DialogDescription>
          </DialogHeader>
          <PengeluaranForm
            expense={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengeluaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengeluaran{" "}
              <span className="font-semibold">{deleting?.description}</span>
              {" "}akan dihapus permanen. Bukti yang terkait juga akan dihapus dari penyimpanan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
