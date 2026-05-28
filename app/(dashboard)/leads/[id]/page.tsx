import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLeadById, getMessagesByLeadId, getNotesByLeadId, getPaymentsByLeadId, isDemoMode } from '@/lib/db'
import { LeadStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge'
import LeadActions from './LeadActions'
import ChatMessages from './ChatMessages'
import ManualReply from './ManualReply'
import type { InternalNote, LeadStatus } from '@/types'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lead, messages, notes, payments] = await Promise.all([
    getLeadById(id),
    getMessagesByLeadId(id),
    getNotesByLeadId(id),
    getPaymentsByLeadId(id),
  ])

  if (!lead) notFound()

  const initials = lead.name
    ? lead.name.trim().split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : lead.phone.slice(-2)

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Human alert banner */}
      {lead.requires_human && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse flex-shrink-0" />
            <p className="text-white font-semibold text-sm">
              Este lead requiere atención humana — el bot está pausado
            </p>
          </div>
          <p className="text-white/70 text-xs">Responde desde el chat o reactiva el bot en Acciones</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-6">
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Leads
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30 flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {lead.name ?? <span className="text-slate-400 italic font-normal text-xl">Sin nombre</span>}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-slate-400 text-sm">{lead.phone}</p>
                {lead.email && <p className="text-slate-500 text-sm">{lead.email}</p>}
                <span className="text-slate-700 text-xs">·</span>
                <p className="text-slate-500 text-xs">
                  {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <LeadStatusBadge status={lead.status as LeadStatus} />
            <PaymentStatusBadge status={lead.payment_status} />
            {lead.requires_human && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                Humano requerido
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-3 gap-5">
        {/* Main column */}
        <div className="col-span-2 space-y-5">
          {/* Summary */}
          {lead.summary && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500 text-base">🧠</span>
                <h3 className="font-bold text-blue-900 text-sm tracking-tight">Resumen automático</h3>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">{lead.summary}</p>
            </div>
          )}

          {/* Chat */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <span className="text-base">💬</span>
                <h3 className="font-bold text-slate-900 text-sm">Conversación</h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{messages.length}</span>
              </div>
              {lead.requires_human && (
                <span className="text-xs text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full font-medium">
                  Bot pausado · Modo humano
                </span>
              )}
            </div>
            <ChatMessages messages={messages} />
            <ManualReply leadId={lead.id} phone={lead.phone} demoMode={isDemoMode()} />
          </div>

          {/* Notes */}
          {notes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-white">
                <span className="text-base">📝</span>
                <h3 className="font-bold text-slate-900 text-sm">Notas internas</h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{notes.length}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {notes.map((n: InternalNote) => (
                  <div key={n.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <p className="text-slate-700 text-sm leading-relaxed">{n.note}</p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {new Date(n.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {payments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-white">
                <span className="text-base">💳</span>
                <h3 className="font-bold text-slate-900 text-sm">Pagos</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {payments.map(p => (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.product_name ?? 'Pago'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.stripe_payment_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-600">{((p.amount ?? 0) / 100).toFixed(2)} €</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-bold text-slate-900 text-sm">Datos del lead</h3>
            </div>
            <div className="p-5">
              <dl className="space-y-3">
                {[
                  { label: 'Teléfono', value: lead.phone, mono: true },
                  { label: 'Email', value: lead.email },
                  { label: 'Interés', value: lead.interest },
                  { label: 'Pack', value: lead.selected_pack },
                  { label: 'Fuente', value: lead.source },
                  { label: 'Alta', value: new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide pt-0.5 flex-shrink-0">{row.label}</dt>
                    <dd className={`text-sm text-slate-900 font-semibold text-right ${row.mono ? 'font-mono' : ''}`}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <LeadActions lead={lead} demoMode={isDemoMode()} />
        </div>
      </div>
    </div>
  )
}
