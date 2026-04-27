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
import { useDeleteAccount, useGetAccounts } from "@/lib/api/accounts"
import type { Account } from "@/types/accounts"

import { RekeningForm } from "./rekening-form"
import { RekeningSkeleton } from "./rekening-skeleton"
import { RekeningTable } from "./rekening-table"

export function RekeningContent() {
  const { data, isLoading, isError, refetch } = useGetAccounts()
  const deleteMutation = useDeleteAccount()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | undefined>(undefined)
  const [deleting, setDeleting] = useState<Account | undefined>(undefined)

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(account: Account) {
    setEditing(account)
    setFormOpen(true)
  }

  function handleDelete(account: Account) {
    setDeleting(account)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Rekening berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus rekening."
      toast.error(message)
    }
  }

  return (
    <>
      <DashboardHeader title="Rekening" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Rekening"
          description="Kelola daftar rekening bank dan cash beserta saldonya."
          showBack={false}
          action={
            <Button onClick={handleAdd}>
              <Icon name="add" size={16} />
              Tambah Rekening
            </Button>
          }
        />

        {isLoading ? (
          <RekeningSkeleton />
        ) : isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat rekening"
            description="Terjadi kesalahan saat memuat daftar rekening."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <RekeningTable
            data={data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Rekening" : "Tambah Rekening"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui informasi rekening."
                : "Isi data rekening baru yang akan ditambahkan."}
            </DialogDescription>
          </DialogHeader>
          <RekeningForm
            account={editing}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus rekening?</AlertDialogTitle>
            <AlertDialogDescription>
              Rekening{" "}
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
