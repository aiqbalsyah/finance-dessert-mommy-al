"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function GajiSkeleton() {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </Card>
  )
}
