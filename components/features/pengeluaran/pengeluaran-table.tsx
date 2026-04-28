"use client"

import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { useAuth } from "@/context/auth-provider"
import { AuditTooltip } from "@/components/shared/audit-tooltip"
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
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { Account } from "@/types/accounts"
import { expenseCategoryLabels, type Expense, type ExpenseCategory } from "@/types/expenses"

interface PengeluaranTableProps {
  data: Expense[]
  accounts: Account[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export function PengeluaranTable({ data, accounts, onEdit, onDelete }: PengeluaranTableProps) {
  const { can } = useAuth()
  const canEdit = can("expenses:update")
  const canDelete = can("expenses:delete")
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])

  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: "spentAt",
        header: "Tanggal",
        cell: ({ row }) => (
          <AuditTooltip
            createdAt={row.original.createdAt}
            updatedAt={row.original.updatedAt}
            createdBy={row.original.createdBy}
            updatedBy={row.original.updatedBy}
          >
            <span className="whitespace-nowrap">{formatDate(row.getValue<number>("spentAt"))}</span>
          </AuditTooltip>
        ),
      },
      {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => (
          <Badge variant="muted">
            {expenseCategoryLabels[row.getValue<ExpenseCategory>("category")]}
          </Badge>
        ),
        filterFn: (row, _id, filterValue) => {
          if (!filterValue) return true
          return row.getValue<ExpenseCategory>("category") === filterValue
        },
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("description")}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Jumlah</div>,
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.getValue<number>("amount"))}
          </div>
        ),
      },
      {
        accessorKey: "accountId",
        header: "Rekening",
        cell: ({ row }) => {
          const account = accountMap.get(row.getValue<string>("accountId"))
          return (
            <span className="text-sm text-muted-foreground">{account?.name ?? "—"}</span>
          )
        },
      },
      {
        id: "receipt",
        header: "Bukti",
        cell: ({ row }) => {
          const url = row.original.receiptUrl
          if (!url) return <span className="text-xs text-muted-foreground">—</span>
          return (
            <Button
              variant="ghost"
              size="sm"
              className="size-9 p-0"
              render={<a href={url} target="_blank" rel="noreferrer noopener" />}
              nativeButton={false}
            >
              <Icon name="image" size={16} />
              <span className="sr-only">Lihat bukti</span>
            </Button>
          )
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const expense = row.original
          if (!canEdit && !canDelete) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" className="size-9 p-0" />}
                >
                  <span className="sr-only">Buka menu aksi</span>
                  <Icon name="more_horiz" size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <Icon name="edit" size={16} />
                        Ubah
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(expense)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Icon name="delete" size={16} />
                        Hapus
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [accountMap, onEdit, onDelete, canEdit, canDelete]
  )

  return (
    <DataTableCard
      title="Daftar Pengeluaran"
      description="Riwayat pengeluaran lain-lain diurutkan dari yang terbaru."
      columns={columns}
      data={data}
      searchKey="description"
      searchPlaceholder="Cari deskripsi..."
      filters={[
        {
          columnKey: "category",
          label: "Kategori",
          options: [
            { label: "Utilitas", value: "utilities" },
            { label: "Sewa", value: "rent" },
            { label: "Transportasi", value: "transport" },
            { label: "Perlengkapan", value: "supplies" },
            { label: "Pemasaran", value: "marketing" },
            { label: "Lainnya", value: "other" },
          ],
        },
      ]}
      sortOptions={[
        { columnKey: "spentAt", label: "Tanggal" },
        { columnKey: "amount", label: "Jumlah" },
      ]}
      emptyMessage="Belum ada pengeluaran tercatat."
      pageSize={10}
      minWidth="900px"
    />
  )
}
