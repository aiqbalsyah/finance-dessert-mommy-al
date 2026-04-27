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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/formatters"
import { accountTypeLabels, type Account, type AccountType } from "@/types/accounts"

interface RekeningTableProps {
  data: Account[]
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export function RekeningTable({ data, onEdit, onDelete }: RekeningTableProps) {
  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Rekening",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("name")}</span>
        ),
      },
      {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => {
          const code = row.original.code
          return code ? (
            <span className="font-mono text-xs">{code}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => {
          const type = row.getValue<AccountType>("type")
          return (
            <Badge variant={type === "bank" ? "info" : "success"}>
              {accountTypeLabels[type]}
            </Badge>
          )
        },
        filterFn: (row, _id, filterValue) => {
          if (!filterValue) return true
          return row.getValue<AccountType>("type") === filterValue
        },
      },
      {
        accessorKey: "balance",
        header: () => <div className="text-right">Saldo</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.getValue<number>("balance"))}
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const account = row.original
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" className="size-8 p-0" />}
                >
                  <span className="sr-only">Buka menu aksi</span>
                  <Icon name="more_horiz" size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onEdit(account)}>
                      <Icon name="edit" size={16} />
                      Ubah
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(account)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Icon name="delete" size={16} />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onEdit, onDelete]
  )

  return (
    <DataTableCard
      title="Daftar Rekening"
      description="Semua rekening bank dan cash yang terdaftar."
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Cari nama rekening..."
      filters={[
        {
          columnKey: "type",
          label: "Tipe",
          options: [
            { label: "Bank", value: "bank" },
            { label: "Cash", value: "cash" },
          ],
        },
      ]}
      sortOptions={[
        { columnKey: "name", label: "Nama" },
        { columnKey: "balance", label: "Saldo" },
      ]}
      emptyMessage="Belum ada rekening. Tambahkan rekening pertama Anda."
      pageSize={10}
    />
  )
}
