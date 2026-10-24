export type Cell = string | number | boolean | null

export interface CsvOptions {
  separator: ';' | ','
  bom: boolean
}

// OWASP CSV injection: texto que começa com esses caracteres vira fórmula na planilha.
const FORMULA_START = /^[=+\-@\t\r]/

export function sanitizeText(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value
}

function formatCell(cell: Cell, separator: string): string {
  if (cell === null) return ''
  if (typeof cell === 'boolean') return cell ? 'sim' : 'nao'
  if (typeof cell === 'number') return String(cell)
  const text = sanitizeText(cell)
  const needsQuotes = text.includes(separator) || /["\n\r]/.test(text)
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(header: string[], rows: Cell[][], { separator, bom }: CsvOptions): string {
  const lines = [header, ...rows].map((row) =>
    row.map((cell) => formatCell(cell, separator)).join(separator)
  )
  // Excel em português só reconhece acento em CSV UTF-8 com BOM.
  return `${bom ? '﻿' : ''}${lines.join('\r\n')}\r\n`
}

const DATE_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Sao_Paulo',
  dateStyle: 'short',
})
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Sao_Paulo',
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatDate(date: Date | null): string | null {
  return date ? DATE_FORMAT.format(date) : null
}

export function formatDateTime(date: Date | null): string | null {
  return date ? DATE_TIME_FORMAT.format(date) : null
}
