"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LaporanSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
