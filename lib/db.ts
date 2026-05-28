import type { Lead, Message, Service, Promotion, Payment, InternalNote } from '@/types'
import {
  MOCK_LEADS,
  MOCK_MESSAGES,
  MOCK_SERVICES,
  MOCK_PROMOTIONS,
  MOCK_PAYMENTS,
  MOCK_NOTES,
  MOCK_SETTINGS,
} from './mock-data'

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// --- Leads ---

function filterLeads(leads: Lead[], filters?: { status?: string; q?: string }): Lead[] {
  let result = [...leads]
  if (filters?.status && filters.status !== 'all') {
    result = result.filter(l => l.status === filters.status)
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase()
    result = result.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.email?.toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export async function getLeads(filters?: { status?: string; q?: string }): Promise<Lead[]> {
  if (isDemoMode()) return filterLeads(MOCK_LEADS, filters)

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  let query = supabase.from('leads').select('*').order('updated_at', { ascending: false })
  if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters?.q) query = query.or(`name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%,email.ilike.%${filters.q}%`)
  const { data } = await query
  return (data ?? []) as Lead[]
}

export async function getLeadsPaginated(filters?: {
  status?: string
  q?: string
  page?: number
  limit?: number
}): Promise<{ leads: Lead[]; total: number }> {
  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 25
  const offset = (page - 1) * limit

  if (isDemoMode()) {
    const all = filterLeads(MOCK_LEADS, filters)
    return { leads: all.slice(offset, offset + limit), total: all.length }
  }

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  let query = supabase.from('leads').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).range(offset, offset + limit - 1)
  if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters?.q) query = query.or(`name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%,email.ilike.%${filters.q}%`)
  const { data, count } = await query
  return { leads: (data ?? []) as Lead[], total: count ?? 0 }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (isDemoMode()) {
    return MOCK_LEADS.find(l => l.id === id) ?? null
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').eq('id', id).single()
  return data as Lead | null
}

export async function getLeadsWithMessages() {
  if (isDemoMode()) {
    return MOCK_LEADS.map(lead => ({
      ...lead,
      messages: MOCK_MESSAGES[lead.id] ?? [],
    }))
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('*, messages(id, content, direction, created_at)')
    .order('updated_at', { ascending: false })
  return data ?? []
}

// --- Messages ---

export async function getMessagesByLeadId(leadId: string): Promise<Message[]> {
  if (isDemoMode()) {
    return (MOCK_MESSAGES[leadId] ?? []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('messages').select('*').eq('lead_id', leadId).order('created_at', { ascending: true })
  return (data ?? []) as Message[]
}

// --- Notes ---

export async function getNotesByLeadId(leadId: string): Promise<InternalNote[]> {
  if (isDemoMode()) {
    return (MOCK_NOTES[leadId] ?? []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('internal_notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
  return (data ?? []) as InternalNote[]
}

// --- Payments ---

export async function getPayments(): Promise<(Payment & { leads?: { name: string | null; phone: string } | null })[]> {
  if (isDemoMode()) {
    return MOCK_PAYMENTS.map(p => ({
      ...p,
      leads: p.lead_id ? { name: MOCK_LEADS.find(l => l.id === p.lead_id)?.name ?? null, phone: MOCK_LEADS.find(l => l.id === p.lead_id)?.phone ?? '' } : null,
    }))
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('payments').select('*, leads(name, phone)').order('created_at', { ascending: false })
  return (data ?? []) as (Payment & { leads?: { name: string | null; phone: string } | null })[]
}

export async function getPaymentsByLeadId(leadId: string): Promise<Payment[]> {
  if (isDemoMode()) {
    return MOCK_PAYMENTS.filter(p => p.lead_id === leadId)
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('payments').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
  return (data ?? []) as Payment[]
}

// --- Services ---

export async function getServices(): Promise<Service[]> {
  if (isDemoMode()) return [...MOCK_SERVICES].sort((a, b) => a.sort_order - b.sort_order)
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('*').order('sort_order')
  return (data ?? []) as Service[]
}

// --- Promotions ---

export async function getPromotions(): Promise<Promotion[]> {
  if (isDemoMode()) return MOCK_PROMOTIONS
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Promotion[]
}

// --- Settings ---

export async function getSettings(): Promise<Record<string, string>> {
  if (isDemoMode()) return { ...MOCK_SETTINGS }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('key, value')
  const settings: Record<string, string> = {}
  for (const row of data ?? []) {
    try {
      settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : String(row.value ?? '')
    } catch {
      settings[row.key] = String(row.value ?? '')
    }
  }
  return settings
}

// --- Metrics ---

export async function getDashboardMetrics() {
  if (isDemoMode()) {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return {
      totalLeads: MOCK_LEADS.length,
      newLeads: MOCK_LEADS.filter(l => new Date(l.created_at) >= weekAgo).length,
      pendingHuman: MOCK_LEADS.filter(l => l.requires_human).length,
      paymentLinkSent: MOCK_LEADS.filter(l => l.status === 'payment_link_sent').length,
      paidLeads: MOCK_LEADS.filter(l => l.status === 'paid').length,
      totalRevenue: MOCK_PAYMENTS.filter(p => p.status === 'succeeded').reduce((s, p) => s + (p.amount ?? 0), 0),
      funnel: {
        new: MOCK_LEADS.filter(l => l.status === 'new').length,
        askedInfo: MOCK_LEADS.filter(l => l.status === 'asked_info').length,
        interested: MOCK_LEADS.filter(l => l.status === 'interested').length,
        paymentLinkSent: MOCK_LEADS.filter(l => l.status === 'payment_link_sent').length,
        paid: MOCK_LEADS.filter(l => l.status === 'paid').length,
      },
      weeklyLeads: [3, 5, 2, 7, 4, 6, 3],
    }
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const [leadsRes, humanRes, linkRes, paymentsRes] = await Promise.all([
    supabase.from('leads').select('id, status, created_at'),
    supabase.from('leads').select('id', { count: 'exact' }).eq('requires_human', true),
    supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'payment_link_sent'),
    supabase.from('payments').select('amount').eq('status', 'succeeded'),
  ])
  const leads = leadsRes.data ?? []
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Build weeklyLeads: index 0 = 6 days ago, index 6 = today
  const weeklyLeads = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    dayStart.setDate(dayStart.getDate() - (6 - i))
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    return leads.filter(l => {
      const createdAt = new Date(l.created_at)
      return createdAt >= dayStart && createdAt < dayEnd
    }).length
  })

  return {
    totalLeads: leads.length,
    newLeads: leads.filter(l => new Date(l.created_at) >= weekAgo).length,
    pendingHuman: humanRes.count ?? 0,
    paymentLinkSent: linkRes.count ?? 0,
    paidLeads: leads.filter(l => l.status === 'paid').length,
    totalRevenue: (paymentsRes.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0),
    funnel: {
      new: leads.filter(l => l.status === 'new').length,
      askedInfo: leads.filter(l => l.status === 'asked_info').length,
      interested: leads.filter(l => l.status === 'interested').length,
      paymentLinkSent: leads.filter(l => l.status === 'payment_link_sent').length,
      paid: leads.filter(l => l.status === 'paid').length,
    },
    weeklyLeads,
  }
}
