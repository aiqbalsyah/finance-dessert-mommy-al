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
import { useDeletePurchase, useGetPurchases } from "@/lib/api/purchases"
import type { Purchase } from "@/types/purchases"

import { BahanForm } from "./bahan-form"
import { BahanSkeleton } from "./bahan-skeleton"
import { BahanTable } from "./bahan-table"

export function BahanContent() {
  const purchasesQuery = useGetPurchases()
  const accountsQuery = useGetAccounts()
  const deleteMutation = useDeletePurchase()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Purchase | undefined>(undefined)
  const [deleting, setDeleting] = useState<Purchase | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(purchase: Purchase) {
    setEditing(purchase)
    setFormOpen(true)
  }

  function handleDelete(purchase: Purchase) {
    setDeleting(purchase)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Pembelian berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pembelian."
      toast.error(message)
    }
  }

  const isLoading = purchasesQuery.isLoading || accountsQuery.isLoading
  const isError = purchasesQuery.isError

  return (
    <>
      <DashboardHeader title="Bahan" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Bahan"
          description="Catat pembelian bahan baku."
          showBack={false}
          action={
            <PermissionGuard permission="purchases:create">
              <Button onClick={handleAdd}>
                <Icon name="add" size={16} />
                Tambah Pembelian
              </Button>
            </PermissionGuard>
          }
        />

        {isLoading ? (
          <BahanSkeleton />
        ) : isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat pembelian"
            description="Terjadi kesalahan saat memuat daftar pembelian."
            action={
              <Button variant="outline" size="sm" onClick={() => purchasesQuery.refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <BahanTable
            data={purchasesQuery.data ?? []}
            accounts={accountsQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Pembelian" : "Tambah Pembelian"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data pembelian bahan."
                : "Catat pembelian bahan baku baru."}
            </DialogDescription>
          </DialogHeader>
          <BahanForm
            purchase={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pembelian?</AlertDialogTitle>
            <AlertDialogDescription>
              Pembelian{" "}
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
