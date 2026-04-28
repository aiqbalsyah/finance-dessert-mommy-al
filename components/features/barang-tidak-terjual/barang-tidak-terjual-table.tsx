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
import { unsoldReasonLabels, type UnsoldItem, type UnsoldReason } from "@/types/unsold-items"

interface BarangTidakTerjualTableProps {
  data: UnsoldItem[]
  onEdit: (item: UnsoldItem) => void
  onDelete: (item: UnsoldItem) => void
}

const reasonVariant: Record<UnsoldReason, "destructive" | "warning" | "secondary" | "muted"> = {
  expired: "destructive",
  damaged: "warning",
  leftover: "secondary",
  other: "muted",
}

function formatDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  if (!year || !month || !day) return dateStr
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ]
  return `${day} ${monthNames[month - 1]} ${year}`
}

export function BarangTidakTerjualTable({ data, onEdit, onDelete }: BarangTidakTerjualTableProps) {
  const { can } = useAuth()
  const canEdit = can("unsold-items:update")
  const canDelete = can("unsold-items:delete")

  const columns = useMemo<ColumnDef<UnsoldItem>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => (
          <AuditTooltip
            createdAt={row.original.createdAt}
            updatedAt={row.original.updatedAt}
            createdBy={row.original.createdBy}
            updatedBy={row.original.updatedBy}
          >
            <span className="whitespace-nowrap">{formatDateString(row.getValue<string>("date"))}</span>
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
        header: () => <div className="text-right">Jumlah</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">{row.getValue<number>("qty")}</div>
        ),
      },
      {
        accessorKey: "reason",
        header: "Alasan",
        cell: ({ row }) => {
          const reason = row.original.reason
          if (!reason) return <span className="text-xs text-muted-foreground">—</span>
          return (
            <Badge variant={reasonVariant[reason]}>
              {unsoldReasonLabels[reason]}
            </Badge>
          )
        },
        filterFn: (row, _id, filterValue) => {
          if (!filterValue) return true
          return row.original.reason === filterValue
        },
      },
      {
        accessorKey: "note",
        header: "Catatan",
        cell: ({ row }) => {
          const note = row.original.note
          return note ? (
            <span className="text-sm text-muted-foreground line-clamp-1">{note}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original
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
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Icon name="edit" size={16} />
                        Ubah
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
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
    [onEdit, onDelete, canEdit, canDelete]
  )

  return (
    <DataTableCard
      title="Daftar Barang Tidak Terjual"
      description="Catatan produk yang tidak terjual per tanggal."
      columns={columns}
      data={data}
      searchKey="productName"
      searchPlaceholder="Cari nama produk..."
      filters={[
        {
          columnKey: "reason",
          label: "Alasan",
          options: [
            { label: "Kadaluarsa", value: "expired" },
            { label: "Rusak", value: "damaged" },
            { label: "Sisa", value: "leftover" },
            { label: "Lainnya", value: "other" },
          ],
        },
      ]}
      sortOptions={[
        { columnKey: "date", label: "Tanggal" },
        { columnKey: "qty", label: "Jumlah" },
      ]}
      emptyMessage="Belum ada catatan barang tidak terjual."
      pageSize={10}
    />
  )
}
