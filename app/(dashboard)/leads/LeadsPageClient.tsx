'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { LeadStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge'
import LeadsDrawer from './LeadsDrawer'
import { timeAgo } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types'

const AVATAR_COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-pink-100 text-pink-700',
]

function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length]
}

function getInitials(name: string | null, phone: string) {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase()
  }
  return phone.slice(-2)
}

interface Props {
  leads: Lead[]
  total: number
  page: number
  totalPages: number
  allLeads: Lead[]
  activeStatus: string
  q?: string
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'requires_human', label: '🚨 Necesita humano' },
  { value: 'new', label: 'Nuevos' },
  { value: 'asked_info', label: 'Pidió info' },
  { value: 'interested', label: 'Interesados' },
  { value: 'payment_link_sent', label: 'Link enviado' },
  { value: 'paid', label: 'Pagados' },
  { value: 'closed', label: 'Cerrados' },
  { value: 'lost', label: 'Perdidos' },
]

export default function LeadsPageClient({ leads, total, page, totalPages, allLeads, activeStatus, q }: Props) {
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null)
  const closeDrawer = useCallback(() => setDrawerLeadId(null), [])

  const countByStatus = (status: string) => {
    if (status === 'all') return allLeads.length
    if (status === 'requires_human') return allLeads.filter(l => l.requires_human).length
    return allLeads.filter(l => l.status === status).length
  }

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    const merged = { status: activeStatus, q, page: String(page), ...overrides }
    if (merged.status && merged.status !== 'all') params.set('status', String(merged.status))
    if (merged.q) params.set('q', String(merged.q))
    if (merged.page && Number(merged.page) > 1) params.set('page', String(merged.page))
    const s = params.toString()
    return `/leads${s ? '?' + s : ''}`
  }

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {total} {total === 1 ? 'contacto' : 'contactos'}
              {q && <span className="text-orange-600"> · búsqueda: "{q}"</span>}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Filtros + búsqueda */}
          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {STATUS_FILTERS.map(f => {
                const count = countByStatus(f.value)
                const isActive = activeStatus === f.value
                return (
                  <Link
                    key={f.value}
                    href={buildHref({ status: f.value, page: 1 })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    {f.label}
                    <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                      {count}
                    </span>
                  </Link>
                )
              })}
            </div>
            <form method="GET" action="/leads" className="flex gap-2 items-center">
              {activeStatus !== 'all' && <input type="hidden" name="status" value={activeStatus} />}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input name="q" defaultValue={q} placeholder="Nombre, teléfono, email..."
                  className="pl-8 pr-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-52 bg-slate-50" />
              </div>
              <button type="submit" className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm">
                Buscar
              </button>
              {q && (
                <Link href={buildHref({ q: undefined, page: 1 })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-full">✕</Link>
              )}
            </form>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Interés</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pago</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Último msg</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...leads].sort((a, b) => (b.requires_human ? 1 : 0) - (a.requires_human ? 1 : 0)).map((lead: Lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setDrawerLeadId(lead.id)}
                    style={lead.requires_human ? { boxShadow: 'inset 3px 0 0 #f87171' } : undefined}
                    className={`transition-all cursor-pointer group ${
                      lead.requires_human
                        ? 'bg-red-50/60 hover:bg-red-50'
                        : 'hover:bg-orange-50/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${avatarColor(lead.id)}`}>
                          {getInitials(lead.name, lead.phone)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                            {lead.name ?? <span className="text-slate-400 font-normal italic text-sm">Sin nombre</span>}
                            {lead.requires_human && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                Urgente
                              </span>
                            )}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5 font-mono">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-sm max-w-[140px]">
                      <p className="truncate">{lead.interest ?? <span className="text-slate-300">—</span>}</p>
                    </td>
                    <td className="px-4 py-4">
                      <LeadStatusBadge status={lead.status as LeadStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <PaymentStatusBadge status={lead.payment_status} />
                    </td>
                    <td className="px-4 py-4 max-w-[180px]">
                      <p className="text-slate-400 truncate text-xs">{lead.last_message ?? '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {timeAgo(lead.updated_at)}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <p className="text-slate-400 text-sm">No hay leads con este filtro</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Página <span className="font-semibold text-slate-700">{page}</span> de <span className="font-semibold text-slate-700">{totalPages}</span>
                {' · '}{total} leads en total
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link href={buildHref({ page: page - 1 })}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors">
                    ← Anterior
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-slate-50 text-slate-300 text-sm font-medium rounded-xl cursor-not-allowed">← Anterior</span>
                )}
                {page < totalPages ? (
                  <Link href={buildHref({ page: page + 1 })}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                    Siguiente →
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-slate-50 text-slate-300 text-sm font-medium rounded-xl cursor-not-allowed">Siguiente →</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <LeadsDrawer leadId={drawerLeadId} onClose={closeDrawer} />
    </>
  )
}
