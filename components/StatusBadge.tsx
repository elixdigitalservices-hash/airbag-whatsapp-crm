import type { LeadStatus } from '@/types'

const STATUS_MAP: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Nuevo', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  asked_info: { label: 'Pidió info', className: 'bg-sky-50 text-sky-700 border border-sky-200' },
  interested: { label: 'Interesado', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
  payment_link_sent: { label: 'Link enviado', className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  paid: { label: '✓ Pagado', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending_human: { label: '🙋 Humano', className: 'bg-orange-500 text-white border border-orange-600' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  lost: { label: 'Perdido', className: 'bg-red-50 text-red-600 border border-red-200' },
}

const PAYMENT_MAP: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Sin pagar', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  paid: { label: '✓ Pagado', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  refunded: { label: 'Reembolsado', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  failed: { label: 'Fallido', className: 'bg-red-50 text-red-600 border border-red-200' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 border border-slate-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.className}`}>
      {s.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = PAYMENT_MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 border border-slate-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.className}`}>
      {s.label}
    </span>
  )
}
