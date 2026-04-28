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
import { useDeleteSale, useGetSales } from "@/lib/api/sales"
import type { Sale } from "@/types/sales"

import { PenjualanForm } from "./penjualan-form"
import { PenjualanSkeleton } from "./penjualan-skeleton"
import { PenjualanTable } from "./penjualan-table"

export function PenjualanContent() {
  const salesQuery = useGetSales()
  const accountsQuery = useGetAccounts()
  const deleteMutation = useDeleteSale()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Sale | undefined>(undefined)
  const [deleting, setDeleting] = useState<Sale | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(sale: Sale) {
    setEditing(sale)
    setFormOpen(true)
  }

  function handleDelete(sale: Sale) {
    setDeleting(sale)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Penjualan berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus penjualan."
      toast.error(message)
    }
  }

  const isLoading = salesQuery.isLoading || accountsQuery.isLoading
  const isError = salesQuery.isError

  return (
    <>
      <DashboardHeader title="Penjualan" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Penjualan"
          description="Catat dan kelola transaksi penjualan."
          showBack={false}
          action={
            <PermissionGuard permission="sales:create">
              <Button onClick={handleAdd}>
                <Icon name="add" size={16} />
                Tambah Penjualan
              </Button>
            </PermissionGuard>
          }
        />

        {isLoading ? (
          <PenjualanSkeleton />
        ) : isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat penjualan"
            description="Terjadi kesalahan saat memuat daftar penjualan."
            action={
              <Button variant="outline" size="sm" onClick={() => salesQuery.refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <PenjualanTable
            data={salesQuery.data ?? []}
            accounts={accountsQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Penjualan" : "Tambah Penjualan"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data transaksi penjualan."
                : "Catat transaksi penjualan baru beserta bukti (opsional)."}
            </DialogDescription>
          </DialogHeader>
          <PenjualanForm
            sale={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus penjualan?</AlertDialogTitle>
            <AlertDialogDescription>
              Penjualan{" "}
              <span className="font-semibold">{deleting?.productName}</span>
              {" "}({deleting?.qty} pcs) akan dihapus permanen. Bukti yang terkait juga akan dihapus dari penyimpanan.
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
