"use client"

import { useState } from "react"
import { toast } from "sonner"

import { DashboardHeader } from "@/components/layouts/dashboard/dashboard-header"
import { PageHeader } from "@/components/layouts/dashboard/page-header"
import { Icon } from "@/components/shared/icon"
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
import { useDeleteSalary, useGetSalaries } from "@/lib/api/salaries"
import type { Salary } from "@/types/salaries"

import { GajiForm } from "./gaji-form"
import { GajiSkeleton } from "./gaji-skeleton"
import { GajiTable } from "./gaji-table"

export function GajiContent() {
  const salariesQuery = useGetSalaries()
  const accountsQuery = useGetAccounts()
  const deleteMutation = useDeleteSalary()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Salary | undefined>(undefined)
  const [deleting, setDeleting] = useState<Salary | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(salary: Salary) {
    setEditing(salary)
    setFormOpen(true)
  }

  function handleDelete(salary: Salary) {
    setDeleting(salary)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Pembayaran gaji berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pembayaran gaji."
      toast.error(message)
    }
  }

  const isLoading = salariesQuery.isLoading || accountsQuery.isLoading
  const isError = salariesQuery.isError

  return (
    <>
      <DashboardHeader title="Gaji" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Gaji"
          description="Catat pembayaran gaji karyawan."
          showBack={false}
          action={
            <Button onClick={handleAdd}>
              <Icon name="add" size={16} />
              Tambah Pembayaran
            </Button>
          }
        />

        {isLoading ? (
          <GajiSkeleton />
        ) : isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat pembayaran gaji"
            description="Terjadi kesalahan saat memuat daftar pembayaran gaji."
            action={
              <Button variant="outline" size="sm" onClick={() => salariesQuery.refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <GajiTable
            data={salariesQuery.data ?? []}
            accounts={accountsQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Pembayaran Gaji" : "Tambah Pembayaran Gaji"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data pembayaran gaji karyawan."
                : "Catat pembayaran gaji karyawan baru."}
            </DialogDescription>
          </DialogHeader>
          <GajiForm
            salary={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pembayaran gaji?</AlertDialogTitle>
            <AlertDialogDescription>
              Pembayaran gaji untuk{" "}
              <span className="font-semibold">{deleting?.employeeName}</span>
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
