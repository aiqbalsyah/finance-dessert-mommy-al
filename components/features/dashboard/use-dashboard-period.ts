"use client"

import { useMemo, useState } from "react"

import { getPeriodRange, type PeriodPreset, type PeriodRange } from "@/components/shared/period-picker"

export function useDashboardPeriod(initial: PeriodPreset = "this-month") {
  const [preset, setPreset] = useState<PeriodPreset>(initial)
  const range = useMemo<PeriodRange>(() => getPeriodRange(preset), [preset])
  return { preset, setPreset, range }
}
