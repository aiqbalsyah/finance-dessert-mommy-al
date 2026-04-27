"use client"

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCustom } from "@/lib/formatters"

export type PeriodPreset = "today" | "this-week" | "this-month" | "last-month"

export interface PeriodRange {
  from: number
  to: number
}

const periodLabels: Record<PeriodPreset, string> = {
  today: "Hari Ini",
  "this-week": "Minggu Ini",
  "this-month": "Bulan Ini",
  "last-month": "Bulan Lalu",
}

const presetOrder: PeriodPreset[] = ["today", "this-week", "this-month", "last-month"]

function unixSec(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

export function getPeriodRange(preset: PeriodPreset): PeriodRange {
  const now = new Date()
  switch (preset) {
    case "today":
      return { from: unixSec(startOfDay(now)), to: unixSec(endOfDay(now)) }
    case "this-week": {
      const start = startOfWeek(now, { weekStartsOn: 1 })
      const end = endOfWeek(now, { weekStartsOn: 1 })
      return { from: unixSec(start), to: unixSec(end) }
    }
    case "this-month":
      return { from: unixSec(startOfMonth(now)), to: unixSec(endOfMonth(now)) }
    case "last-month": {
      const lastMonth = subMonths(now, 1)
      return { from: unixSec(startOfMonth(lastMonth)), to: unixSec(endOfMonth(lastMonth)) }
    }
  }
}

export function formatPeriodRange(range: PeriodRange): string {
  return `${formatCustom(range.from, "d MMM yyyy")} – ${formatCustom(range.to, "d MMM yyyy")}`
}

interface PeriodPickerProps {
  value: PeriodPreset
  onChange: (preset: PeriodPreset) => void
  className?: string
}

export function PeriodPicker({ value, onChange, className }: PeriodPickerProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange((v ?? "this-month") as PeriodPreset)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presetOrder.map((preset) => (
          <SelectItem key={preset} value={preset}>
            {periodLabels[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { periodLabels }
