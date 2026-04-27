/**
 * Date formatting utilities using date-fns with id-ID locale.
 *
 * All date data from the backend arrives as Unix timestamps (seconds).
 */

import {
  format,
  formatDistanceToNow,
  formatRelative,
  isToday,
  isYesterday,
  isThisYear,
  fromUnixTime,
} from "date-fns"
import { id } from "date-fns/locale"

const LOCALE_OPTS = { locale: id } as const

/** Convert Unix timestamp (seconds) to Date object. */
export function fromTimestamp(timestamp: number): Date {
  return fromUnixTime(timestamp)
}

/** Full date: "15 Apr 2026" */
export function formatDate(timestamp: number): string {
  return format(fromTimestamp(timestamp), "d MMM yyyy", LOCALE_OPTS)
}

/** Short date: "15 Apr" (omits year if current year). */
export function formatDateShort(timestamp: number): string {
  const date = fromTimestamp(timestamp)
  if (isThisYear(date)) {
    return format(date, "d MMM", LOCALE_OPTS)
  }
  return format(date, "d MMM yyyy", LOCALE_OPTS)
}

/** Date + time: "15 Apr 2026, 14:30" (24h format common in Indonesia). */
export function formatDateTime(timestamp: number): string {
  return format(fromTimestamp(timestamp), "d MMM yyyy, HH:mm", LOCALE_OPTS)
}

/** Short date + time: "15 Apr, 14:30" (omits year if current year). */
export function formatDateTimeShort(timestamp: number): string {
  const date = fromTimestamp(timestamp)
  if (isThisYear(date)) {
    return format(date, "d MMM, HH:mm", LOCALE_OPTS)
  }
  return format(date, "d MMM yyyy, HH:mm", LOCALE_OPTS)
}

/** Time only 12h: "2:30 PM" — kept for legacy callers; prefer 24h. */
export function formatTime(timestamp: number): string {
  return format(fromTimestamp(timestamp), "HH:mm", LOCALE_OPTS)
}

/** Time only 24h: "14:30" */
export function formatTime24(timestamp: number): string {
  return format(fromTimestamp(timestamp), "HH:mm", LOCALE_OPTS)
}

/** Relative time: "5 menit yang lalu", "dalam 3 jam" */
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(fromTimestamp(timestamp), { addSuffix: true, locale: id })
}

/** Smart format — "14:30" today, "Kemarin, 14:30", "15 Apr, 14:30" otherwise. */
export function formatSmart(timestamp: number): string {
  const date = fromTimestamp(timestamp)

  if (isToday(date)) {
    return format(date, "HH:mm", LOCALE_OPTS)
  }
  if (isYesterday(date)) {
    return `Kemarin, ${format(date, "HH:mm", LOCALE_OPTS)}`
  }
  if (isThisYear(date)) {
    return format(date, "d MMM, HH:mm", LOCALE_OPTS)
  }
  return format(date, "d MMM yyyy, HH:mm", LOCALE_OPTS)
}

/** Format relative to a reference date. */
export function formatRelativeTo(
  timestamp: number,
  baseTimestamp: number
): string {
  return formatRelative(
    fromTimestamp(timestamp),
    fromTimestamp(baseTimestamp),
    { locale: id }
  )
}

/** ISO date string: "2026-04-15" — locale-independent, useful for IDs/keys. */
export function formatISO(timestamp: number): string {
  return format(fromTimestamp(timestamp), "yyyy-MM-dd")
}

/** ISO datetime string: "2026-04-15T14:30:00" */
export function formatISODateTime(timestamp: number): string {
  return format(fromTimestamp(timestamp), "yyyy-MM-dd'T'HH:mm:ss")
}

/** Custom date-fns pattern with id locale. */
export function formatCustom(timestamp: number, pattern: string): string {
  return format(fromTimestamp(timestamp), pattern, LOCALE_OPTS)
}
