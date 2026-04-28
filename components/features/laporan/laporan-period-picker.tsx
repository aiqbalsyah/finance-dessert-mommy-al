"use client"

import { PeriodPicker, type PeriodPreset } from "@/components/shared/period-picker"

interface LaporanPeriodPickerProps {
  value: PeriodPreset
  onChange: (preset: PeriodPreset) => void
}

export function LaporanPeriodPicker({ value, onChange }: LaporanPeriodPickerProps) {
  return <PeriodPicker value={value} onChange={onChange} className="w-full sm:w-40" />
}
