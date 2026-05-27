import { getDashboardMetrics } from '@/lib/db'

const CARDS = (m: Awaited<ReturnType<typeof getDashboardMetrics>>) => [
  {
    label: 'Leads totales',
    value: m.totalLeads,
    sub: 'Todos los contactos',
    icon: '👥',
    color: 'border-slate-300',
    iconBg: 'bg-slate-100',
    valueColor: 'text-slate-900',
  },
  {
    label: 'Nuevos esta semana',
    value: m.newLeads,
    sub: 'Últimos 7 días',
    icon: '📈',
    color: 'border-orange-400',
    iconBg: 'bg-orange-50',
    valueColor: 'text-orange-600',
  },
  {
    label: 'Links de pago enviados',
    value: m.paymentLinkSent,
    sub: 'Esperando confirmación',
    icon: '🔗',
    color: 'border-violet-400',
    iconBg: 'bg-violet-50',
    valueColor: 'text-violet-600',
  },
  {
    label: 'Pagos recibidos',
    value: m.paidLeads,
    sub: 'Alumnos confirmados',
    icon: '✅',
    color: 'border-green-400',
    iconBg: 'bg-green-50',
    valueColor: 'text-green-700',
  },
  {
    label: 'Pendientes de humano',
    value: m.pendingHuman,
    sub: 'Requieren atención',
    icon: '🙋',
    color: 'border-orange-500',
    iconBg: 'bg-orange-50',
    valueColor: 'text-orange-600',
  },
  {
    label: 'Ingresos Stripe',
    value: `${(m.totalRevenue / 100).toFixed(2)} €`,
    sub: 'Pagos completados',
    icon: '💰',
    color: 'border-emerald-400',
    iconBg: 'bg-emerald-50',
    valueColor: 'text-emerald-700',
  },
]

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()
  const cards = CARDS(metrics)

  return (
    <div className="p-8">
      {/* Banner urgente */}
      {metrics.pendingHuman > 0 && (
        <a
          href="/leads?status=pending_human"
          className="flex items-center gap-3 bg-orange-500 text-white px-5 py-3.5 rounded-2xl mb-6 hover:bg-orange-600 transition-colors shadow-sm group"
        >
          <span className="text-xl">🙋</span>
          <div className="flex-1">
            <p className="font-bold text-sm">
              {metrics.pendingHuman} {metrics.pendingHuman === 1 ? 'lead requiere' : 'leads requieren'} atención humana
            </p>
            <p className="text-orange-200 text-xs">Haz clic para ver los leads pendientes</p>
          </div>
          <span className="bg-white/20 group-hover:bg-white/30 font-bold text-sm px-3 py-1 rounded-full transition-colors">
            Ver →
          </span>
        </a>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Resumen general de Autoescuela Airbag</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border-l-4 ${card.color} border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center text-base`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Acceso rápido */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/leads?status=pending_human', label: 'Pendientes humano', icon: '🙋', urgent: metrics.pendingHuman > 0 },
            { href: '/leads?status=new', label: 'Leads nuevos', icon: '✨', urgent: false },
            { href: '/conversations', label: 'Conversaciones', icon: '💬', urgent: false },
            { href: '/payments', label: 'Pagos', icon: '💳', urgent: false },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:shadow-sm ${
                item.urgent
                  ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.urgent && metrics.pendingHuman > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {metrics.pendingHuman}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
