import Link from 'next/link'
import { getLeads } from '@/lib/db'
import { LeadStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge'
import type { Lead, LeadStatus } from '@/types'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Nuevos' },
  { value: 'asked_info', label: 'Pidió info' },
  { value: 'interested', label: 'Interesados' },
  { value: 'payment_link_sent', label: 'Link enviado' },
  { value: 'paid', label: 'Pagados' },
  { value: 'pending_human', label: '🙋 Humano' },
  { value: 'closed', label: 'Cerrados' },
  { value: 'lost', label: 'Perdidos' },
]

function getInitials(name: string | null, phone: string) {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return phone.slice(-2)
}

const AVATAR_COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-pink-100 text-pink-700',
]

function avatarColor(id: string) {
  const n = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length
  return AVATAR_COLORS[n]
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const params = await searchParams
  const activeStatus = params.status ?? 'all'

  // Cargamos todos para contar por estado
  const allLeads = await getLeads()
  const leads = await getLeads({ status: params.status, q: params.q })

  const countByStatus = (status: string) =>
    status === 'all'
      ? allLeads.length
      : allLeads.filter(l => l.status === status).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {leads.length} {leads.length === 1 ? 'contacto' : 'contactos'}
            {params.q && <span className="text-orange-600"> · búsqueda: "{params.q}"</span>}
          </p>
        </div>
      </div>

      {/* Barra de filtros + búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {STATUS_FILTERS.map(f => {
              const count = countByStatus(f.value)
              const isActive = activeStatus === f.value
              return (
                <Link
                  key={f.value}
                  href={`/leads?status=${f.value}${params.q ? `&q=${params.q}` : ''}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Búsqueda */}
          <form method="GET" action="/leads" className="flex gap-2 items-center">
            {params.status && params.status !== 'all' && (
              <input type="hidden" name="status" value={params.status} />
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Nombre, teléfono, email..."
                className="pl-8 pr-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-52 bg-slate-50"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
            >
              Buscar
            </button>
            {params.q && (
              <Link
                href={`/leads${params.status ? `?status=${params.status}` : ''}`}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-full transition-colors"
              >
                ✕
              </Link>
            )}
          </form>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Interés</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pago</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último mensaje</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead: Lead) => (
                <tr key={lead.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(lead.id)}`}>
                        {getInitials(lead.name, lead.phone)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                          {lead.name ?? <span className="text-slate-400 font-normal italic">Sin nombre</span>}
                          {lead.requires_human && (
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" title="Pendiente humano" />
                          )}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">{lead.phone}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 text-sm">{lead.interest ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3.5">
                    <LeadStatusBadge status={lead.status as LeadStatus} />
                  </td>
                  <td className="px-4 py-3.5">
                    <PaymentStatusBadge status={lead.payment_status} />
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="text-slate-500 truncate text-xs">{lead.last_message ?? <span className="text-slate-300">Sin mensajes</span>}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="text-slate-400 text-sm">No hay leads con este filtro</p>
                    {params.q && (
                      <Link href="/leads" className="text-orange-500 text-sm hover:underline mt-2 inline-block">
                        Quitar búsqueda
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
