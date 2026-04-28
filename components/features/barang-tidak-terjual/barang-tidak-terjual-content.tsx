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
import { useDeleteUnsoldItem, useGetUnsoldItems } from "@/lib/api/unsold-items"
import type { UnsoldItem } from "@/types/unsold-items"

import { BarangTidakTerjualForm } from "./barang-tidak-terjual-form"
import { BarangTidakTerjualSkeleton } from "./barang-tidak-terjual-skeleton"
import { BarangTidakTerjualTable } from "./barang-tidak-terjual-table"

export function BarangTidakTerjualContent() {
  const itemsQuery = useGetUnsoldItems()
  const deleteMutation = useDeleteUnsoldItem()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<UnsoldItem | undefined>(undefined)
  const [deleting, setDeleting] = useState<UnsoldItem | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(item: UnsoldItem) {
    setEditing(item)
    setFormOpen(true)
  }

  function handleDelete(item: UnsoldItem) {
    setDeleting(item)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Catatan berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus catatan."
      toast.error(message)
    }
  }

  return (
    <>
      <DashboardHeader title="Barang Tidak Terjual" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Barang Tidak Terjual"
          description="Catat produk yang tidak terjual per tanggal."
          showBack={false}
          action={
            <PermissionGuard permission="unsold-items:create">
              <Button onClick={handleAdd}>
                <Icon name="add" size={16} />
                Tambah Catatan
              </Button>
            </PermissionGuard>
          }
        />

        {itemsQuery.isLoading ? (
          <BarangTidakTerjualSkeleton />
        ) : itemsQuery.isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat catatan"
            description="Terjadi kesalahan saat memuat catatan barang tidak terjual."
            action={
              <Button variant="outline" size="sm" onClick={() => itemsQuery.refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <BarangTidakTerjualTable
            data={itemsQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Catatan" : "Tambah Catatan"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui catatan barang tidak terjual."
                : "Catat produk yang tidak terjual hari ini atau pada tanggal tertentu."}
            </DialogDescription>
          </DialogHeader>
          <BarangTidakTerjualForm
            item={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus catatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan{" "}
              <span className="font-semibold">{deleting?.productName}</span>
              {" "}({deleting?.qty} pcs) akan dihapus permanen.
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
