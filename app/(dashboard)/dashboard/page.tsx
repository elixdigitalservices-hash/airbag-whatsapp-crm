import Link from 'next/link'
import { getDashboardMetrics } from '@/lib/db'

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#f97316' }: { data: number[]; color?: string }) {
  const W = 160; const H = 48
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [
    Math.round((i / (data.length - 1)) * W),
    Math.round(H - (v / max) * H * 0.85 + H * 0.075),
  ] as [number, number])
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const gradId = `sg-${color.replace('#', '')}`
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} />
      ))}
    </svg>
  )
}

// ── Bar chart SVG ─────────────────────────────────────────────────────────────

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const H = 80
  return (
    <div className="flex items-end gap-1.5 h-24 pt-4">
      {data.map((v, i) => {
        const h = Math.max(4, Math.round((v / max) * H))
        const isToday = i === data.length - 1
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-bold text-slate-500">{v > 0 ? v : ''}</span>
            <div
              className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-orange-500' : 'bg-orange-200'}`}
              style={{ height: h }}
            />
            <span className={`text-[10px] font-semibold ${isToday ? 'text-orange-600' : 'text-slate-400'}`}>{DAYS[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Funnel ────────────────────────────────────────────────────────────────────

function FunnelBar({ label, count, max, color, convPct }: {
  label: string; count: number; max: number; color: string; convPct?: number
}) {
  const w = max > 0 ? Math.max(8, Math.round((count / max) * 100)) : 8
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-9 bg-slate-100 rounded-xl overflow-hidden">
        <div className={`h-full ${color} rounded-xl flex items-center px-3 transition-all`} style={{ width: `${w}%` }}>
          <span className="text-xs font-bold text-white drop-shadow-sm">{count}</span>
        </div>
      </div>
      {convPct !== undefined && (
        <span className="text-xs font-semibold text-slate-400 w-10 flex-shrink-0">
          {convPct > 0 ? `${convPct}%` : '—'}
        </span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const m = await getDashboardMetrics()
  const revenue = (m.totalRevenue / 100).toFixed(2)

  const funnelStages = [
    { label: 'Nuevos', count: m.funnel.new, color: 'bg-slate-400' },
    { label: 'Pidió info', count: m.funnel.askedInfo, color: 'bg-orange-300' },
    { label: 'Interesados', count: m.funnel.interested, color: 'bg-orange-400' },
    { label: 'Link enviado', count: m.funnel.paymentLinkSent, color: 'bg-orange-500' },
    { label: 'Pagados', count: m.funnel.paid, color: 'bg-emerald-500' },
  ]
  const funnelMax = Math.max(...funnelStages.map(s => s.count), 1)

  const convPcts = funnelStages.map((s, i) => {
    if (i === funnelStages.length - 1) return undefined
    const next = funnelStages[i + 1].count
    return s.count > 0 ? Math.round((next / s.count) * 100) : 0
  })

  return (
    <div className="p-6 space-y-5">

      {/* Urgent banner */}
      {m.pendingHuman > 0 && (
        <Link href="/leads?status=pending_human"
          className="flex items-center gap-3 bg-orange-500 text-white px-5 py-3.5 rounded-2xl hover:bg-orange-600 transition-colors shadow-sm group">
          <span className="text-xl">🙋</span>
          <div className="flex-1">
            <p className="font-bold text-sm">
              {m.pendingHuman} {m.pendingHuman === 1 ? 'lead requiere' : 'leads requieren'} atención humana
            </p>
            <p className="text-orange-200 text-xs">Haz clic para verlos ahora</p>
          </div>
          <span className="bg-white/20 group-hover:bg-white/30 font-bold text-sm px-3 py-1 rounded-full transition-colors">Ver →</span>
        </Link>
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Bot activo
        </div>
      </div>

      {/* Hero row: revenue + weekly chart */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue hero */}
        <div className="col-span-2 bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Ingresos Stripe</p>
              <p className="text-5xl font-black text-white leading-none">
                {revenue.split('.')[0]}<span className="text-2xl text-slate-400">.{revenue.split('.')[1]} €</span>
              </p>
              <div className="flex items-center gap-5 mt-4">
                <div>
                  <p className="text-2xl font-black text-orange-400">{m.totalLeads}</p>
                  <p className="text-xs text-slate-500">leads totales</p>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <p className="text-2xl font-black text-emerald-400">{m.paidLeads}</p>
                  <p className="text-xs text-slate-500">pagados</p>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <p className="text-2xl font-black text-orange-300">{m.newLeads}</p>
                  <p className="text-xs text-slate-500">nuevos esta semana</p>
                </div>
              </div>
            </div>
            <div className="opacity-80">
              <Sparkline data={m.weeklyLeads} color="#f97316" />
              <p className="text-[10px] text-slate-500 text-right mt-1">leads / 7 días</p>
            </div>
          </div>
        </div>

        {/* New leads chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nuevos leads</p>
            <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">7 días</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {m.weeklyLeads.reduce((a, b) => a + b, 0)}
          </p>
          <BarChart data={m.weeklyLeads} />
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Leads totales', value: m.totalLeads, icon: '👥', trend: null, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-200' },
          { label: 'Link de pago enviado', value: m.paymentLinkSent, icon: '🔗', trend: null, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
          { label: 'Pendientes humano', value: m.pendingHuman, icon: '🙋', trend: null, color: m.pendingHuman > 0 ? 'text-orange-600' : 'text-slate-400', bg: m.pendingHuman > 0 ? 'bg-orange-50' : 'bg-slate-50', border: m.pendingHuman > 0 ? 'border-orange-200' : 'border-slate-200' },
          { label: 'Alumnos pagados', value: m.paidLeads, icon: '✅', trend: null, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border ${c.border} ${c.bg} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p className={`text-3xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel + Quick access */}
      <div className="grid grid-cols-3 gap-5">

        {/* Conversion funnel */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900">Embudo de conversión</h2>
              <p className="text-xs text-slate-400 mt-0.5">Progresión de leads por estado</p>
            </div>
            <Link href="/leads" className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2.5">
            {funnelStages.map((s, i) => (
              <FunnelBar
                key={s.label}
                label={s.label}
                count={s.count}
                max={funnelMax}
                color={s.color}
                convPct={convPcts[i]}
              />
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Tasa de conversión total</span>
            <span className="font-bold text-emerald-600 text-sm">
              {m.totalLeads > 0 ? `${Math.round((m.funnel.paid / m.totalLeads) * 100)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Quick access */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <h2 className="font-bold text-slate-900 text-sm mb-4">Acceso rápido</h2>
            <div className="space-y-2">
              {[
                { href: '/leads?status=pending_human', label: 'Pendientes humano', icon: '🙋', urgent: m.pendingHuman > 0, count: m.pendingHuman },
                { href: '/leads?status=new', label: 'Leads nuevos', icon: '✨', urgent: false, count: m.funnel.new },
                { href: '/leads?status=payment_link_sent', label: 'Esperando pago', icon: '🔗', urgent: false, count: m.paymentLinkSent },
                { href: '/payments', label: 'Ver pagos', icon: '💳', urgent: false, count: null },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-sm ${
                    item.urgent
                      ? 'bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.urgent ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Conversion rate mini card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-sm shadow-orange-200">
            <p className="text-orange-200 text-xs font-semibold uppercase tracking-wide mb-1">Conversión leads → alumnos</p>
            <p className="text-4xl font-black">
              {m.totalLeads > 0 ? `${Math.round((m.paidLeads / m.totalLeads) * 100)}` : '0'}
              <span className="text-xl text-orange-200">%</span>
            </p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${m.totalLeads > 0 ? Math.round((m.paidLeads / m.totalLeads) * 100) : 0}%` }}
              />
            </div>
            <p className="text-orange-200 text-xs mt-2">{m.paidLeads} pagados de {m.totalLeads} leads</p>
          </div>
        </div>
      </div>

    </div>
  )
}
