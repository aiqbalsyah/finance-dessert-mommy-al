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
import { productCategoryLabels, type Product, type ProductCategory } from "@/types/products"

interface MasterProdukTableProps {
  data: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function MasterProdukTable({ data, onEdit, onDelete }: MasterProdukTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Produk",
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue<string>("name")}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => (
          <Badge variant="muted">
            {productCategoryLabels[row.getValue<ProductCategory>("category")]}
          </Badge>
        ),
        filterFn: (row, _id, filterValue) => {
          if (!filterValue) return true
          return row.getValue<ProductCategory>("category") === filterValue
        },
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right">Harga</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.getValue<number>("price"))}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const active = row.getValue<boolean>("isActive")
          return (
            <Badge variant={active ? "success" : "secondary"}>
              {active ? "Aktif" : "Tidak Aktif"}
            </Badge>
          )
        },
        filterFn: (row, _id, filterValue) => {
          if (filterValue === undefined || filterValue === "") return true
          return String(row.getValue<boolean>("isActive")) === filterValue
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const product = row.original
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
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Icon name="edit" size={16} />
                      Ubah
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(product)}
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
      title="Daftar Produk"
      description="Master data produk untuk kebutuhan input penjualan dan barang tidak terjual."
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Cari nama produk..."
      filters={[
        {
          columnKey: "category",
          label: "Kategori",
          options: [
            { label: "Kue", value: "cake" },
            { label: "Kue Kering", value: "cookie" },
            { label: "Pastry", value: "pastry" },
            { label: "Minuman", value: "drink" },
            { label: "Lainnya", value: "other" },
          ],
        },
        {
          columnKey: "isActive",
          label: "Status",
          options: [
            { label: "Aktif", value: "true" },
            { label: "Tidak Aktif", value: "false" },
          ],
        },
      ]}
      sortOptions={[
        { columnKey: "name", label: "Nama" },
        { columnKey: "price", label: "Harga" },
      ]}
      emptyMessage="Belum ada produk. Tambahkan produk pertama Anda."
      pageSize={10}
    />
  )
}
