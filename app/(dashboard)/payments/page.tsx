import Link from 'next/link'
import { getPayments } from '@/lib/db'
import type { Payment } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  succeeded: { label: 'Cobrado', color: 'bg-emerald-100 text-emerald-700' },
  paid: { label: 'Cobrado', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Devuelto', color: 'bg-amber-100 text-amber-700' },
  unknown: { label: 'Desconocido', color: 'bg-slate-100 text-slate-500' },
}

export default async function PaymentsPage() {
  const payments = await getPayments()
  const total = payments
    .filter(p => p.status === 'succeeded' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const count = payments.filter(p => p.status === 'succeeded' || p.status === 'paid').length

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
          <p className="text-slate-400 mt-1 text-sm">{payments.length} registros · {count} cobrados</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Total cobrado</p>
          <p className="text-2xl font-black text-emerald-700">{(total / 100).toFixed(2)} €</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Cliente', 'Producto', 'Importe', 'Estado', 'Lead', 'Fecha', 'Stripe ID'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p: Payment & { leads?: { name: string | null; phone: string } | null }) => {
                const st = STATUS_MAP[p.status] ?? STATUS_MAP.unknown
                return (
                  <tr key={p.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900 group-hover:text-orange-700 transition-colors">{p.customer_name ?? '—'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.customer_email ?? p.customer_phone ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.product_name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900">
                        {p.amount != null ? `${(p.amount / 100).toFixed(2)} €` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.lead_id ? (
                        <Link href={`/leads/${p.lead_id}`} className="text-orange-600 hover:text-orange-700 text-xs font-medium transition-colors">
                          {p.leads?.name ?? p.leads?.phone ?? p.lead_id.slice(0, 8)} →
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Sin asociar</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {(p.paid_at ?? p.created_at) && new Date(p.paid_at ?? p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-300 font-mono">{p.stripe_payment_id?.slice(0, 20) ?? '—'}</span>
                    </td>
                  </tr>
                )
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-4xl mb-3">💳</p>
                    <p className="text-slate-400 text-sm">No hay pagos registrados</p>
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
