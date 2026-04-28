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
import { useAuth } from "@/context/auth-provider"
import { useDeleteUser, useGetUsers, useResetUserPassword } from "@/lib/api/users"
import type { User } from "@/types/users"

import { PenggunaCredentialsDialog } from "./pengguna-credentials-dialog"
import { PenggunaForm } from "./pengguna-form"
import { PenggunaSkeleton } from "./pengguna-skeleton"
import { PenggunaTable } from "./pengguna-table"

interface CredentialsState {
  email: string
  password: string
  title?: string
  description?: string
}

export function PenggunaContent() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const usersQuery = useGetUsers()
  const deleteMutation = useDeleteUser()
  const resetMutation = useResetUserPassword()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | undefined>(undefined)
  const [deleting, setDeleting] = useState<User | undefined>(undefined)
  const [resetting, setResetting] = useState<User | undefined>(undefined)
  const [credentials, setCredentials] = useState<CredentialsState | null>(null)

  const canManage = currentUser?.role === "admin"

  // Page-level guard: non-admin gets a not-authorized state instead of the table.
  if (!authLoading && currentUser && !canManage) {
    return (
      <>
        <DashboardHeader title="Pengguna" />
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <PageHeader title="Pengguna" showBack={false} />
          <StateCard
            icon="lock"
            iconClassName="text-muted-foreground"
            title="Akses ditolak"
            description="Anda tidak memiliki akses ke halaman ini. Hubungi administrator."
          />
        </div>
      </>
    )
  }

  function handleAdd() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function handleEdit(user: User) {
    setEditing(user)
    setFormOpen(true)
  }

  function handleDelete(user: User) {
    setDeleting(user)
  }

  function handleResetPassword(user: User) {
    setResetting(user)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Pengguna berhasil dihapus.")
      setDeleting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pengguna."
      toast.error(message)
    }
  }

  async function confirmReset() {
    if (!resetting) return
    try {
      const result = await resetMutation.mutateAsync(resetting.id)
      setCredentials({
        email: resetting.email,
        password: result.tempPassword,
        title: "Kata Sandi Direset",
        description: "Berikan kata sandi sementara ini ke pengguna. Mereka wajib mengubahnya saat login berikutnya.",
      })
      setResetting(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mereset kata sandi."
      toast.error(message)
    }
  }

  return (
    <>
      <DashboardHeader title="Pengguna" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Pengguna"
          description="Kelola akun pengguna dan hak aksesnya."
          showBack={false}
          action={
            <Button onClick={handleAdd}>
              <Icon name="add" size={16} />
              Tambah Pengguna
            </Button>
          }
        />

        {usersQuery.isLoading ? (
          <PenggunaSkeleton />
        ) : usersQuery.isError ? (
          <StateCard
            icon="error"
            iconClassName="text-destructive"
            title="Gagal memuat pengguna"
            description="Terjadi kesalahan saat memuat daftar pengguna."
            action={
              <Button variant="outline" size="sm" onClick={() => usersQuery.refetch()}>
                <Icon name="refresh" size={16} />
                Coba lagi
              </Button>
            }
          />
        ) : (
          <PenggunaTable
            data={usersQuery.data ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
          />
        )}
      </div>

      {/* Create/edit form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Pengguna" : "Tambah Pengguna"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui informasi pengguna."
                : "Buat akun baru. Pengguna akan menerima kata sandi sementara untuk login pertama."}
            </DialogDescription>
          </DialogHeader>
          <PenggunaForm
            user={editing}
            onCreated={(created, password) => {
              setFormOpen(false)
              setCredentials({ email: created.email, password })
            }}
            onUpdated={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna <span className="font-semibold">{deleting?.displayName}</span>
              {" "}({deleting?.email}) akan dihapus permanen dari sistem dan Firebase Authentication.
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

      {/* Reset password confirmation */}
      <AlertDialog open={Boolean(resetting)} onOpenChange={(o) => !o && setResetting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset kata sandi?</AlertDialogTitle>
            <AlertDialogDescription>
              Kata sandi pengguna <span className="font-semibold">{resetting?.displayName}</span>
              {" "}akan diganti dengan kata sandi sementara baru. Pengguna wajib mengubahnya saat login berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? "Memproses..." : "Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credentials display (post-create or post-reset) */}
      {credentials && (
        <PenggunaCredentialsDialog
          open
          email={credentials.email}
          password={credentials.password}
          title={credentials.title}
          description={credentials.description}
          onClose={() => setCredentials(null)}
        />
      )}
    </>
  )
}
