import Link from 'next/link'
import { getPayments } from '@/lib/db'
import type { Payment } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  succeeded: 'bg-green-50 text-green-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-amber-50 text-amber-700',
  unknown: 'bg-slate-100 text-slate-600',
}

export default async function PaymentsPage() {
  const payments = await getPayments()
  const total = payments
    .filter(p => p.status === 'succeeded' || p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
          <p className="text-slate-500 mt-1 text-sm">{payments.length} pagos · Total cobrado: {(total / 100).toFixed(2)} €</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Importe</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Lead</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Stripe ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment: Payment & { leads?: { name: string | null; phone: string } | null }) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{payment.customer_name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{payment.customer_email ?? payment.customer_phone ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{payment.product_name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {payment.amount != null ? `${(payment.amount / 100).toFixed(2)} €` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {payment.lead_id ? (
                      <Link href={`/leads/${payment.lead_id}`} className="text-blue-600 hover:underline text-xs">
                        {payment.leads?.name ?? payment.leads?.phone ?? payment.lead_id.slice(0, 8)}
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Sin asociar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {(payment.paid_at ?? payment.created_at) && new Date(payment.paid_at ?? payment.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 font-mono">{payment.stripe_payment_id?.slice(0, 20) ?? '—'}</span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">No hay pagos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
