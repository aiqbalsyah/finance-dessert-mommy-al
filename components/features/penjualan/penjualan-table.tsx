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
import type { Sale } from "@/types/sales"

interface PenjualanTableProps {
  data: Sale[]
  accounts: Account[]
  onEdit: (sale: Sale) => void
  onDelete: (sale: Sale) => void
}

export function PenjualanTable({ data, accounts, onEdit, onDelete }: PenjualanTableProps) {
  const { can } = useAuth()
  const canEdit = can("sales:update")
  const canDelete = can("sales:delete")

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  )

  const columns = useMemo<ColumnDef<Sale>[]>(
    () => [
      {
        accessorKey: "soldAt",
        header: "Tanggal",
        cell: ({ row }) => (
          <AuditTooltip
            createdAt={row.original.createdAt}
            updatedAt={row.original.updatedAt}
            createdBy={row.original.createdBy}
            updatedBy={row.original.updatedBy}
          >
            <span className="whitespace-nowrap">{formatDate(row.getValue<number>("soldAt"))}</span>
          </AuditTooltip>
        ),
      },
      {
        accessorKey: "productName",
        header: "Produk",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("productName")}</span>
        ),
      },
      {
        accessorKey: "qty",
        header: () => <div className="text-right">Qty</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">{row.getValue<number>("qty")}</div>
        ),
      },
      {
        accessorKey: "unitPrice",
        header: () => <div className="text-right">Harga Satuan</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.getValue<number>("unitPrice"))}
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.getValue<number>("total"))}
          </div>
        ),
      },
      {
        accessorKey: "accountId",
        header: "Rekening",
        cell: ({ row }) => {
          const account = accountMap.get(row.getValue<string>("accountId"))
          return (
            <span className="text-sm text-muted-foreground">
              {account?.name ?? "—"}
            </span>
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
          const sale = row.original
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
                      <DropdownMenuItem onClick={() => onEdit(sale)}>
                        <Icon name="edit" size={16} />
                        Ubah
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(sale)}
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
      title="Daftar Penjualan"
      description="Riwayat transaksi penjualan diurutkan dari yang terbaru."
      columns={columns}
      data={data}
      searchKey="productName"
      searchPlaceholder="Cari nama produk..."
      sortOptions={[
        { columnKey: "soldAt", label: "Tanggal" },
        { columnKey: "total", label: "Total" },
      ]}
      emptyMessage="Belum ada penjualan tercatat."
      pageSize={10}
      minWidth="900px"
    />
  )
}
