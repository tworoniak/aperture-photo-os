import type { SupabaseClient } from "@supabase/supabase-js"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export interface DashboardStats {
  revenueMonth: number
  revenueLastMonth: number
  upcomingBookings: number
  upcomingBookingsLastMonth: number
  activeClients: number
  activeClientsLastMonth: number
  pendingInvoices: number
  pendingInvoicesAmount: number
}

export interface RevenueChartPoint {
  month: string
  revenue: number
}

export interface UpcomingBooking {
  id: string
  clientName: string
  sessionType: string
  date: string
  location?: string
  status: string
  depositPaid: boolean
  totalAmount: number
}

export interface RecentClient {
  id: string
  name: string
  email: string
  status: string
  totalShoots: number
  totalRevenue: number
  lastContact?: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function fetchDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const now = new Date()
  const monthStart    = startOfMonth(now).toISOString()
  const monthEnd      = endOfMonth(now).toISOString()
  const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
  const lastMonthEnd   = endOfMonth(subMonths(now, 1)).toISOString()
  const today          = now.toISOString().split("T")[0]

  // Revenue this month
  const { data: revenueData } = await supabase
    .from("bookings")
    .select("total_amount")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("date", monthStart.split("T")[0])
    .lte("date", monthEnd.split("T")[0])

  const revenueMonth = (revenueData ?? []).reduce(
    (sum, b) => sum + (b.total_amount ?? 0), 0
  )

  // Revenue last month
  const { data: lastRevenueData } = await supabase
    .from("bookings")
    .select("total_amount")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("date", lastMonthStart.split("T")[0])
    .lte("date", lastMonthEnd.split("T")[0])

  const revenueLastMonth = (lastRevenueData ?? []).reduce(
    (sum, b) => sum + (b.total_amount ?? 0), 0
  )

  // Upcoming bookings (next 30 days)
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0]

  const { count: upcomingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["confirmed", "pending"])
    .gte("date", today)
    .lte("date", in30Days)

  // Upcoming bookings last period (previous 30 days)
  const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0]
  const prev30End = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0]

  const { count: lastUpcomingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["confirmed", "pending"])
    .gte("date", prev30Start)
    .lte("date", prev30End)

  // Active clients
  const { count: activeCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active")

  // Active clients last month (approximation — created before last month)
  const { count: lastActiveCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active")
    .lt("created_at", lastMonthEnd)

  // Pending invoices
  const { data: pendingData } = await supabase
    .from("bookings")
    .select("deposit_amount, total_amount")
    .eq("user_id", userId)
    .eq("deposit_paid", false)
    .neq("status", "cancelled")

  const pendingInvoices = (pendingData ?? []).length
  const pendingInvoicesAmount = (pendingData ?? []).reduce(
    (sum, b) => sum + (b.deposit_amount ?? 0), 0
  )

  return {
    revenueMonth,
    revenueLastMonth,
    upcomingBookings:          upcomingCount ?? 0,
    upcomingBookingsLastMonth: lastUpcomingCount ?? 0,
    activeClients:             activeCount ?? 0,
    activeClientsLastMonth:    lastActiveCount ?? 0,
    pendingInvoices,
    pendingInvoicesAmount,
  }
}

// ─── Revenue chart ────────────────────────────────────────────────────────────

export async function fetchRevenueChart(
  supabase: SupabaseClient,
  userId: string
): Promise<RevenueChartPoint[]> {
  const now = new Date()
  const sixMonthsAgo = startOfMonth(subMonths(now, 5)).toISOString().split("T")[0]
  const thisMonthEnd  = endOfMonth(now).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("bookings")
    .select("date, total_amount")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("date", sixMonthsAgo)
    .lte("date", thisMonthEnd)

  if (error) throw error

  // Group by year-month key so months never collide across years
  const revenueByKey: Record<string, number> = {}
  for (const row of data ?? []) {
    const key = format(new Date(row.date), "yyyy-MM")
    revenueByKey[key] = (revenueByKey[key] ?? 0) + (row.total_amount ?? 0)
  }

  // Build all 6 points in chronological order, filling gaps with 0
  return Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i)
    return {
      month:   format(month, "MMM"),
      revenue: revenueByKey[format(month, "yyyy-MM")] ?? 0,
    }
  })
}

// ─── Upcoming bookings ────────────────────────────────────────────────────────

export async function fetchUpcomingBookings(
  supabase: SupabaseClient,
  userId: string
): Promise<UpcomingBooking[]> {
  const today    = new Date().toISOString().split("T")[0]
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("bookings")
    .select("id, client_name, session_type, date, location, status, deposit_paid, total_amount")
    .eq("user_id", userId)
    .in("status", ["confirmed", "pending"])
    .gte("date", today)
    .lte("date", in30Days)
    .order("date", { ascending: true })
    .limit(5)

  if (error) throw error

  return (data ?? []).map((b) => ({
    id:           b.id,
    clientName:   b.client_name,
    sessionType:  b.session_type,
    date:         b.date,
    location:     b.location,
    status:       b.status,
    depositPaid:  b.deposit_paid,
    totalAmount:  b.total_amount,
  }))
}

// ─── Recent clients ───────────────────────────────────────────────────────────

export async function fetchRecentClients(
  supabase: SupabaseClient,
  userId: string
): Promise<RecentClient[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, email, status, total_shoots, total_revenue, last_contact")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) throw error

  return (data ?? []).map((c) => ({
    id:           c.id,
    name:         c.name,
    email:        c.email,
    status:       c.status,
    totalShoots:  c.total_shoots,
    totalRevenue: c.total_revenue,
    lastContact:  c.last_contact,
  }))
}
