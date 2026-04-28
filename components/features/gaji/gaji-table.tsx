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
import type { Salary } from "@/types/salaries"

interface GajiTableProps {
  data: Salary[]
  accounts: Account[]
  onEdit: (salary: Salary) => void
  onDelete: (salary: Salary) => void
}

function formatPeriod(period: string): string {
  // "2026-04" → "April 2026"
  const [year, month] = period.split("-").map(Number)
  if (!year || !month) return period
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  return `${monthNames[month - 1]} ${year}`
}

export function GajiTable({ data, accounts, onEdit, onDelete }: GajiTableProps) {
  const { can } = useAuth()
  const canEdit = can("salaries:update")
  const canDelete = can("salaries:delete")
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])

  const columns = useMemo<ColumnDef<Salary>[]>(
    () => [
      {
        accessorKey: "paidAt",
        header: "Tanggal",
        cell: ({ row }) => (
          <AuditTooltip
            createdAt={row.original.createdAt}
            updatedAt={row.original.updatedAt}
            createdBy={row.original.createdBy}
            updatedBy={row.original.updatedBy}
          >
            <span className="whitespace-nowrap">{formatDate(row.getValue<number>("paidAt"))}</span>
          </AuditTooltip>
        ),
      },
      {
        accessorKey: "employeeName",
        header: "Nama Karyawan",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("employeeName")}</span>
        ),
      },
      {
        accessorKey: "period",
        header: "Periode",
        cell: ({ row }) => (
          <span className="text-sm">{formatPeriod(row.getValue<string>("period"))}</span>
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
              className="size-8 p-0"
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
          const salary = row.original
          if (!canEdit && !canDelete) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
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
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(salary)}>
                        <Icon name="edit" size={16} />
                        Ubah
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(salary)}
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
      title="Daftar Pembayaran Gaji"
      description="Riwayat pembayaran gaji karyawan diurutkan dari yang terbaru."
      columns={columns}
      data={data}
      searchKey="employeeName"
      searchPlaceholder="Cari nama karyawan..."
      sortOptions={[
        { columnKey: "paidAt", label: "Tanggal" },
        { columnKey: "amount", label: "Jumlah" },
      ]}
      emptyMessage="Belum ada pembayaran gaji tercatat."
      pageSize={10}
      minWidth="900px"
    />
  )
}
