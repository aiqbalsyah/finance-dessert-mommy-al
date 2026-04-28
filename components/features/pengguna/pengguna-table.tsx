"use client"

import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { Icon } from "@/components/shared/icon"
import { DataTableCard } from "@/components/shared/data-table-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-provider"
import {
  userRoleLabels,
  userStatusLabels,
  type User,
  type UserRole,
  type UserStatus,
} from "@/types/users"

interface PenggunaTableProps {
  data: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onResetPassword: (user: User) => void
}

const roleVariant: Record<UserRole, "destructive" | "info" | "success" | "muted"> = {
  admin: "destructive",
  manager: "info",
  kasir: "success",
  viewer: "muted",
}

export function PenggunaTable({ data, onEdit, onDelete, onResetPassword }: PenggunaTableProps) {
  const { user: currentUser } = useAuth()

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("email")}</span>
        ),
      },
      {
        accessorKey: "displayName",
        header: "Nama",
        cell: ({ row }) => row.getValue<string>("displayName"),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue<UserRole>("role")
          return <Badge variant={roleVariant[role]}>{userRoleLabels[role]}</Badge>
        },
        filterFn: (row, _id, filterValue) => {
          if (!filterValue) return true
          return row.getValue<UserRole>("role") === filterValue
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue<UserStatus>("status")
          return (
            <Badge variant={status === "active" ? "success" : "secondary"}>
              {userStatusLabels[status]}
            </Badge>
          )
        },
        filterFn: (row, _id, filterValue) => {
          if (!filterValue) return true
          return row.getValue<UserStatus>("status") === filterValue
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original
          const isSelf = currentUser?.id === user.id
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="size-9 p-0" />}>
                  <span className="sr-only">Buka menu aksi</span>
                  <Icon name="more_horiz" size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Icon name="edit" size={16} />
                      Ubah
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetPassword(user)}>
                      <Icon name="key" size={16} />
                      Reset Kata Sandi
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {!isSelf && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => onDelete(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Icon name="delete" size={16} />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [currentUser, onEdit, onDelete, onResetPassword]
  )

  return (
    <DataTableCard
      title="Daftar Pengguna"
      description="Kelola akun pengguna dan hak aksesnya."
      columns={columns}
      data={data}
      searchKey="email"
      searchPlaceholder="Cari email..."
      filters={[
        {
          columnKey: "role",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "Manajer", value: "manager" },
            { label: "Kasir", value: "kasir" },
            { label: "Hanya Lihat", value: "viewer" },
          ],
        },
        {
          columnKey: "status",
          label: "Status",
          options: [
            { label: "Aktif", value: "active" },
            { label: "Nonaktif", value: "disabled" },
          ],
        },
      ]}
      sortOptions={[
        { columnKey: "email", label: "Email" },
        { columnKey: "displayName", label: "Nama" },
      ]}
      emptyMessage="Belum ada pengguna terdaftar."
      pageSize={10}
    />
  )
}
