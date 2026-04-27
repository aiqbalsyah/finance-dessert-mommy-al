"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableFilterOption {
  label: string
  value: string
}

interface DataTableFilter {
  columnKey: string
  label: string
  options: DataTableFilterOption[]
}

interface DataTableSortOption {
  columnKey: string
  label: string
}

interface DataTableCardProps<TData, TValue> {
  title: string
  description?: string
  action?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  sortOptions?: DataTableSortOption[]
  maxHeight?: string
  minWidth?: string
  className?: string
  emptyMessage?: string
  pageSize?: number
  showPagination?: boolean
  showSelectedCount?: boolean
  showSearch?: boolean
  showColumnFilter?: boolean
}

export function DataTableCard<TData, TValue>({
  title,
  description,
  action,
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filters,
  sortOptions,
  maxHeight = "500px",
  minWidth,
  className,
  emptyMessage = "No results.",
  pageSize = 10,
  showPagination = true,
  showSelectedCount = false,
  showSearch = true,
  showColumnFilter = true,
}: DataTableCardProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: searchKey ? undefined : globalFilter,
    },
    initialState: {
      pagination: { pageSize },
    },
  })

  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1
  const hasToolbar =
    showSearch ||
    (filters && filters.length > 0) ||
    (sortOptions && sortOptions.length > 0) ||
    showColumnFilter

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Section title — outside card */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold md:text-2xl">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground md:text-base">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showSearch && (
            <div className="relative w-full max-w-search">
              <Icon
                name="search"
                size={20}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={searchPlaceholder}
                value={
                  searchKey
                    ? ((table
                        .getColumn(searchKey)
                        ?.getFilterValue() as string) ?? "")
                    : globalFilter
                }
                onChange={(e) => {
                  if (searchKey) {
                    table
                      .getColumn(searchKey)
                      ?.setFilterValue(e.target.value)
                  } else {
                    setGlobalFilter(e.target.value)
                  }
                }}
                className="h-10 rounded-lg pl-12"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {filters?.map((filter) => {
              const activeValue =
                (table
                  .getColumn(filter.columnKey)
                  ?.getFilterValue() as string) ?? ""
              return (
                <DropdownMenu key={filter.columnKey}>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        className="rounded-action px-4 py-2"
                      />
                    }
                  >
                    <Icon name="filter_list" size={16} />
                    {activeValue || filter.label}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          table
                            .getColumn(filter.columnKey)
                            ?.setFilterValue("")
                        }
                      >
                        All {filter.label}
                        {!activeValue && (
                          <Icon
                            name="check"
                            size={14}
                            className="ml-auto text-muted-foreground"
                          />
                        )}
                      </DropdownMenuItem>
                      {filter.options.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() =>
                            table
                              .getColumn(filter.columnKey)
                              ?.setFilterValue(opt.value)
                          }
                        >
                          {opt.label}
                          {activeValue === opt.value && (
                            <Icon
                              name="check"
                              size={14}
                              className="ml-auto text-muted-foreground"
                            />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}

            {sortOptions && sortOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="rounded-action px-4 py-2"
                    />
                  }
                >
                  <Icon name="sort" size={16} />
                  Sort By
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    {sortOptions.map((opt) => (
                      <DropdownMenuItem
                        key={opt.columnKey}
                        onClick={() => {
                          const current = sorting[0]
                          if (current?.id === opt.columnKey) {
                            setSorting([
                              { id: opt.columnKey, desc: !current.desc },
                            ])
                          } else {
                            setSorting([{ id: opt.columnKey, desc: false }])
                          }
                        }}
                      >
                        {opt.label}
                        {sorting[0]?.id === opt.columnKey && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {sorting[0].desc ? "Z→A" : "A→Z"}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  {sorting.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSorting([])}>
                        Clear sort
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {showColumnFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="rounded-action px-4 py-2"
                    />
                  }
                >
                  <Icon name="view_column" size={16} />
                  Columns
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Card with table */}
      <Card className="overflow-hidden rounded-lg py-0 shadow-none">
        <div className="overflow-auto" style={{ minHeight: maxHeight, maxHeight }}>
          <div style={minWidth ? { minWidth } : undefined}>
            <Table>
              <TableHeader className="sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-table-header"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() &&
                            (header.column.getIsSorted() === "asc" ? (
                              <Icon name="arrow_upward" size={14} />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <Icon name="arrow_downward" size={14} />
                            ) : (
                              <Icon
                                name="swap_vert"
                                size={14}
                                className="text-muted-foreground"
                              />
                            ))}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination footer */}
        {showPagination && (
          <div className="flex items-center justify-between border-t px-4 py-3 md:px-6 md:py-4">
            <span className="text-sm text-muted-foreground">
              {showSelectedCount
                ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
                : `${table.getFilteredRowModel().rows.length} row(s) total`}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pageCount}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <Icon name="first_page" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <Icon name="chevron_left" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <Icon name="chevron_right" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <Icon name="last_page" size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export type { DataTableFilter, DataTableFilterOption, DataTableSortOption }
