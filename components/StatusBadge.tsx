import type { LeadStatus, PaymentStatus } from '@/types'

const STATUS_MAP: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Nuevo', className: 'bg-slate-100 text-slate-700' },
  asked_info: { label: 'Pidió info', className: 'bg-blue-50 text-blue-700' },
  interested: { label: 'Interesado', className: 'bg-sky-50 text-sky-700' },
  payment_link_sent: { label: 'Link enviado', className: 'bg-violet-50 text-violet-700' },
  paid: { label: 'Pagado', className: 'bg-green-50 text-green-700' },
  pending_human: { label: 'Pendiente humano', className: 'bg-orange-50 text-orange-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-500' },
  lost: { label: 'Perdido', className: 'bg-red-50 text-red-700' },
}

const PAYMENT_MAP: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Sin pagar', className: 'bg-slate-100 text-slate-600' },
  paid: { label: 'Pagado', className: 'bg-green-50 text-green-700' },
  refunded: { label: 'Reembolsado', className: 'bg-amber-50 text-amber-700' },
  failed: { label: 'Fallido', className: 'bg-red-50 text-red-700' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = PAYMENT_MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}
