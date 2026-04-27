"use client"

import * as React from "react"
import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TableCardColumn<T> {
  key: string
  header: string
  className?: string
  render?: (row: T) => React.ReactNode
}

interface TableCardProps<T> {
  title: string
  description?: string
  action?: React.ReactNode
  columns: TableCardColumn<T>[]
  data: T[]
  maxHeight?: string
  minWidth?: string
  className?: string
  emptyMessage?: string
  pageSize?: number
  showPagination?: boolean
}

export function TableCard<T extends Record<string, unknown>>({
  title,
  description,
  action,
  columns,
  data,
  maxHeight = "400px",
  minWidth,
  className,
  emptyMessage = "No data available.",
  pageSize,
  showPagination = false,
}: TableCardProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(0)

  const isPaginated = showPagination && pageSize && pageSize > 0
  const pageCount = isPaginated ? Math.ceil(data.length / pageSize) : 1
  const displayData = isPaginated
    ? data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : data

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

      {/* Card with table */}
      <Card className="overflow-hidden rounded-lg py-0 shadow-none">
        <div className="overflow-auto" style={{ maxHeight }}>
          <div style={minWidth ? { minWidth } : undefined}>
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="hover:bg-table-header">
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length > 0 ? (
                  displayData.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={cn("whitespace-nowrap", col.className)}
                        >
                          {col.render
                            ? col.render(row)
                            : String(row[col.key] ?? "")}
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
        {isPaginated && pageCount > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 md:px-6 md:py-4">
            <span className="text-sm text-muted-foreground">
              {data.length} row(s) total
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pageCount}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  <Icon name="first_page" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 0}
                >
                  <Icon name="chevron_left" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= pageCount - 1}
                >
                  <Icon name="chevron_right" size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-action"
                  onClick={() => setCurrentPage(pageCount - 1)}
                  disabled={currentPage >= pageCount - 1}
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

export type { TableCardColumn }
