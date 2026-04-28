"use client"

import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { useAuth } from "@/context/auth-provider"
import { AuditTooltip } from "@/components/shared/audit-tooltip"
import { Icon } from "@/components/shared/icon"
import { DataTableCard } from "@/components/shared/data-table-card"
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
import type { Purchase } from "@/types/purchases"

interface BahanTableProps {
  data: Purchase[]
  accounts: Account[]
  onEdit: (purchase: Purchase) => void
  onDelete: (purchase: Purchase) => void
}

export function BahanTable({ data, accounts, onEdit, onDelete }: BahanTableProps) {
  const { can } = useAuth()
  const canEdit = can("purchases:update")
  const canDelete = can("purchases:delete")
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])

  const columns = useMemo<ColumnDef<Purchase>[]>(
    () => [
      {
        accessorKey: "purchasedAt",
        header: "Tanggal",
        cell: ({ row }) => (
          <AuditTooltip
            createdAt={row.original.createdAt}
            updatedAt={row.original.updatedAt}
            createdBy={row.original.createdBy}
            updatedBy={row.original.updatedBy}
          >
            <span className="whitespace-nowrap">{formatDate(row.getValue<number>("purchasedAt"))}</span>
          </AuditTooltip>
        ),
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("description")}</span>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({ row }) => {
          const vendor = row.original.vendor
          return vendor ? (
            <span className="text-sm">{vendor}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        },
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
          const purchase = row.original
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
                      <DropdownMenuItem onClick={() => onEdit(purchase)}>
                        <Icon name="edit" size={16} />
                        Ubah
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(purchase)}
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
      title="Daftar Pembelian Bahan"
      description="Riwayat pembelian bahan baku diurutkan dari yang terbaru."
      columns={columns}
      data={data}
      searchKey="description"
      searchPlaceholder="Cari deskripsi..."
      sortOptions={[
        { columnKey: "purchasedAt", label: "Tanggal" },
        { columnKey: "amount", label: "Jumlah" },
      ]}
      emptyMessage="Belum ada pembelian tercatat."
      pageSize={10}
      minWidth="900px"
    />
  )
}
