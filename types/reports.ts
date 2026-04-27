import type { AccountType } from "@/types/accounts"
import type { ExpenseCategory } from "@/types/expenses"

export interface PeriodSummary {
  totalRevenue: number
  totalPurchases: number
  totalSalaries: number
  totalExpenses: number
  totalOutflow: number
  netProfit: number
  salesCount: number
  purchasesCount: number
  salariesCount: number
  expensesCount: number
}

export interface AccountBalanceItem {
  accountId: string
  accountName: string
  accountType: AccountType
  accountCode?: string
  balance: number
  transactionCount: number
}

export interface TopProductItem {
  productId: string
  productName: string
  totalQty: number
  totalRevenue: number
  salesCount: number
}

export interface TopUnsoldProductItem {
  productId: string
  productName: string
  totalUnsoldQty: number
  recordCount: number
}

export interface ExpenseBreakdownItem {
  category: ExpenseCategory
  total: number
  count: number
}
