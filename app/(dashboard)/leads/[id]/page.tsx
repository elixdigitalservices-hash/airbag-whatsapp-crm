import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLeadById, getMessagesByLeadId, getNotesByLeadId, getPaymentsByLeadId } from '@/lib/db'
import { isDemoMode } from '@/lib/db'
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/leads" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
          ← Volver a leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {lead.name ?? <span className="text-slate-400 italic font-normal">Sin nombre</span>}
            </h1>
            <p className="text-slate-500 mt-0.5">{lead.phone}</p>
          </div>
          <div className="flex gap-2">
            <LeadStatusBadge status={lead.status as LeadStatus} />
            <PaymentStatusBadge status={lead.payment_status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {lead.summary && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 text-sm mb-1">Resumen automático</h3>
              <p className="text-blue-800 text-sm">{lead.summary}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Conversación ({messages.length} mensajes)</h3>
            </div>
            <ChatMessages messages={messages} />
            <ManualReply leadId={lead.id} phone={lead.phone} demoMode={isDemoMode()} />
          </div>

          {notes.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Notas internas</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {notes.map((n: InternalNote) => (
                  <div key={n.id} className="px-5 py-3">
                    <p className="text-slate-700 text-sm">{n.note}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payments.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Pagos asociados</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {payments.map(p => (
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.product_name ?? 'Pago'}</p>
                      <p className="text-xs text-slate-400">{p.stripe_payment_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">{((p.amount ?? 0) / 100).toFixed(2)} €</p>
                      <p className="text-xs text-slate-400">{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Datos del lead</h3>
            <dl className="space-y-2 text-sm">
              {[
                { label: 'Teléfono', value: lead.phone },
                { label: 'Email', value: lead.email },
                { label: 'Interés', value: lead.interest },
                { label: 'Pack', value: lead.selected_pack },
                { label: 'Fuente', value: lead.source },
                { label: 'Entrada', value: new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex justify-between gap-2">
                  <dt className="text-slate-500">{row.label}</dt>
                  <dd className="text-slate-900 font-medium text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <LeadActions lead={lead} demoMode={isDemoMode()} />
        </div>
      </div>
    </div>
  )
}
