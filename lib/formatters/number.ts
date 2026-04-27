/**
 * Number formatting utilities.
 *
 * Locale: id-ID (Indonesian) — uses dot for thousands and comma for decimals.
 * Currency: IDR (Rupiah) — no decimal subunits in practice.
 */

const DEFAULT_LOCALE = "id-ID"
const DEFAULT_CURRENCY = "IDR"

/** Format a number with locale-aware thousand separators (id-ID uses dots). */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value)
}

/** Format as Rupiah: "Rp 25.000". No decimal places by default. */
export function formatCurrency(
  value: number,
  currency: string = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(value)
}

/** Compact number: 1500 → "1,5 rb" / 1500000 → "1,5 jt" (id-ID short scale). */
export function formatCompact(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value)
}

/** Compact Rupiah: 1500000 → "Rp 1,5 jt". Useful for dashboards. */
export function formatCompactRupiah(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value)
}

/** Percentage from a decimal (0.156 → "15,6%"). */
export function formatPercent(
  value: number,
  decimals = 1,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...options,
  }).format(value)
}

/** Fixed decimal places (3.14159, 2 → "3,14"). */
export function formatDecimal(
  value: number,
  decimals = 2,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...options,
  }).format(value)
}

/** Bytes → human-readable size (1024 → "1 KB"). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/** Sign prefix (12.5 → "+12,5", -3.2 → "-3,2"). */
export function formatWithSign(value: number, decimals = 1): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${formatDecimal(value, decimals)}`
}

/** Integer with thousand separators (1234567 → "1.234.567"). */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits: 0,
  }).format(value)
}
