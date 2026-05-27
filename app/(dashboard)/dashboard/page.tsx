import { getDashboardMetrics } from '@/lib/db'

function MetricCard({
  label, value, sub, color,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color ?? 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Resumen general de Autoescuela Airbag</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Leads totales" value={metrics.totalLeads} sub="Todos los contactos" />
        <MetricCard label="Nuevos esta semana" value={metrics.newLeads} sub="Últimos 7 días" color="text-blue-600" />
        <MetricCard label="Links de pago enviados" value={metrics.paymentLinkSent} sub="En espera de pago" color="text-violet-600" />
        <MetricCard label="Pagos recibidos" value={metrics.paidLeads} sub="Leads marcados como pagados" color="text-green-600" />
        <MetricCard label="Pendientes de humano" value={metrics.pendingHuman} sub="Requieren atención manual" color="text-orange-600" />
        <MetricCard
          label="Ingresos Stripe"
          value={`${(metrics.totalRevenue / 100).toFixed(2)} €`}
          sub="Pagos completados"
          color="text-green-700"
        />
      </div>
    </div>
  )
}
