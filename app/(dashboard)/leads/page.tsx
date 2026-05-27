import Link from 'next/link'
import { getLeads } from '@/lib/db'
import { LeadStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge'
import type { Lead, LeadStatus } from '@/types'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Nuevos' },
  { value: 'interested', label: 'Interesados' },
  { value: 'payment_link_sent', label: 'Link enviado' },
  { value: 'paid', label: 'Pagados' },
  { value: 'pending_human', label: 'Pendiente humano' },
  { value: 'lost', label: 'Perdidos' },
]

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const params = await searchParams
  const leads = await getLeads({ status: params.status, q: params.q })
  const activeStatus = params.status ?? 'all'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1 text-sm">{leads.length} contactos encontrados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 items-center">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {STATUS_FILTERS.map(f => (
              <Link
                key={f.value}
                href={`/leads?status=${f.value}${params.q ? `&q=${params.q}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeStatus === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <form method="GET" action="/leads" className="flex gap-2">
            {params.status && <input type="hidden" name="status" value={params.status} />}
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Buscar nombre, teléfono..."
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <button type="submit" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700">
              Buscar
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Contacto</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Interés</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Pago</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Último mensaje</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead: Lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="block">
                      <p className="font-medium text-slate-900">
                        {lead.name ?? <span className="text-slate-400 italic">Sin nombre</span>}
                        {lead.requires_human && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-orange-500" title="Pendiente humano" />
                        )}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">{lead.phone}</p>
                      {lead.email && <p className="text-slate-400 text-xs">{lead.email}</p>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.interest ?? '—'}</td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status as LeadStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={lead.payment_status} />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-600 truncate text-xs">{lead.last_message ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No hay leads con este filtro
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
