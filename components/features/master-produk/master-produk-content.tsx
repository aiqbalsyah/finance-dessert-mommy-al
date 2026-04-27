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
import { useDeleteProduct, useGetProducts } from "@/lib/api/products"
import type { Product } from "@/types/products"

import { MasterProdukForm } from "./master-produk-form"
import { MasterProdukSkeleton } from "./master-produk-skeleton"
import { MasterProdukTable } from "./master-produk-table"

export function MasterProdukContent() {
  const { data, isLoading, isError, refetch } = useGetProducts()
  const deleteMutation = useDeleteProduct()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | undefined>(undefined)
  const [deleting, setDeleting] = useState<Product | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(product: Product) {
    setEditing(product)
    setFormOpen(true)
  }

  function handleDelete(product: Product) {
    setDeleting(product)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Produk berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus produk."
      toast.error(message)
    }
  }

  return (
    <>
      <DashboardHeader title="Master Produk" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Master Produk"
          description="Kelola daftar produk yang dijual."
          showBack={false}
          action={
            <Button onClick={handleAdd}>
              <Icon name="add" size={16} />
              Tambah Produk
            </Button>
          }
        />

        {isLoading ? (
          <MasterProdukSkeleton />
        ) : isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat produk"
            description="Terjadi kesalahan saat memuat daftar produk."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <MasterProdukTable
            data={data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Produk" : "Tambah Produk"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui informasi produk."
                : "Isi data produk baru yang akan ditambahkan."}
            </DialogDescription>
          </DialogHeader>
          <MasterProdukForm
            product={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk{" "}
              <span className="font-semibold">{deleting?.name}</span>{" "}
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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
