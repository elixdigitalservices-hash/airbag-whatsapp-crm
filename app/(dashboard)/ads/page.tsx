const CAMPAIGNS = [
  {
    name: 'Carnet B · Oferta Verano',
    platform: 'Meta',
    platformColor: 'bg-blue-100 text-blue-700',
    status: 'active',
    budget: 350,
    spent: 218.40,
    impressions: 24600,
    clicks: 743,
    leads: 18,
    cpl: 12.13,
    ctr: 3.02,
    startDate: '01/05/2026',
  },
  {
    name: 'Moto A2 · Tomares',
    platform: 'Google',
    platformColor: 'bg-red-100 text-red-700',
    status: 'active',
    budget: 200,
    spent: 87.20,
    impressions: 11340,
    clicks: 312,
    leads: 7,
    cpl: 12.46,
    ctr: 2.75,
    startDate: '10/05/2026',
  },
  {
    name: 'Carnet B · Retargeting',
    platform: 'Meta',
    platformColor: 'bg-blue-100 text-blue-700',
    status: 'paused',
    budget: 150,
    spent: 150.00,
    impressions: 6900,
    clicks: 192,
    leads: 13,
    cpl: 11.54,
    ctr: 2.78,
    startDate: '15/04/2026',
  },
  {
    name: 'CAP · Conductores profesionales',
    platform: 'Google',
    platformColor: 'bg-red-100 text-red-700',
    status: 'draft',
    budget: 500,
    spent: 0,
    impressions: 0,
    clicks: 0,
    leads: 0,
    cpl: 0,
    ctr: 0,
    startDate: '—',
  },
]

const BAR_DATA = [
  { day: 'L', impressions: 3200, clicks: 98, leads: 3 },
  { day: 'M', impressions: 4100, clicks: 124, leads: 5 },
  { day: 'X', impressions: 3850, clicks: 109, leads: 4 },
  { day: 'J', impressions: 5200, clicks: 158, leads: 6 },
  { day: 'V', impressions: 6100, clicks: 187, leads: 7 },
  { day: 'S', impressions: 4700, clicks: 143, leads: 6 },
  { day: 'D', impressions: 2750, clicks: 84, leads: 2 },
]

const MAX_IMP = Math.max(...BAR_DATA.map(d => d.impressions))

function statusBadge(s: string) {
  if (s === 'active') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Activa</span>
  if (s === 'paused') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pausada</span>
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Borrador</span>
}

export default function AdsPage() {
  const totalImpressions = CAMPAIGNS.reduce((a, c) => a + c.impressions, 0)
  const totalClicks = CAMPAIGNS.reduce((a, c) => a + c.clicks, 0)
  const totalLeads = CAMPAIGNS.reduce((a, c) => a + c.leads, 0)
  const totalSpent = CAMPAIGNS.reduce((a, c) => a + c.spent, 0)
  const avgCPL = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : '—'

  return (
    <div className="p-8">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📣</span>
            <h1 className="text-xl font-bold text-white">Campañas de Ads</h1>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
          <p className="text-slate-400 text-sm">Meta Ads + Google Ads integrados — gestiona todo desde el CRM</p>
        </div>
        <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm font-semibold rounded-xl border border-orange-500/30 transition-colors cursor-not-allowed">
          Conectar cuentas →
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Impresiones', value: totalImpressions.toLocaleString('es-ES'), sub: 'Esta semana', icon: '👁️', color: 'border-sky-400', vc: 'text-sky-600' },
          { label: 'Clics', value: totalClicks.toLocaleString('es-ES'), sub: 'CTR medio 2.9%', icon: '🖱️', color: 'border-violet-400', vc: 'text-violet-600' },
          { label: 'Leads generados', value: String(totalLeads), sub: 'De anuncios', icon: '🎯', color: 'border-orange-400', vc: 'text-orange-600' },
          { label: 'Coste por lead', value: `${avgCPL} €`, sub: 'CPL medio', icon: '💶', color: 'border-emerald-400', vc: 'text-emerald-600' },
          { label: 'Inversión total', value: `${totalSpent.toFixed(2)} €`, sub: `De ${CAMPAIGNS.reduce((a, c) => a + c.budget, 0)} € presupuesto`, icon: '📊', color: 'border-rose-400', vc: 'text-rose-600' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border-l-4 ${c.color} border border-slate-100 p-5 shadow-sm`}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">{c.label}</p>
              <span className="text-lg">{c.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${c.vc}`}>{c.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Gráfico de barras semanal */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 text-sm">Rendimiento semanal</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />Impresiones</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-violet-400 inline-block" />Clics × 10</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />Leads × 100</span>
            </div>
          </div>
          {/* Bar chart SVG */}
          <div className="flex items-end gap-3 h-40">
            {BAR_DATA.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full justify-center">
                  <div
                    className="flex-1 bg-orange-400 rounded-t-sm"
                    style={{ height: `${Math.round((d.impressions / MAX_IMP) * 140)}px` }}
                  />
                  <div
                    className="flex-1 bg-violet-400 rounded-t-sm"
                    style={{ height: `${Math.round(((d.clicks * 10) / MAX_IMP) * 140)}px` }}
                  />
                  <div
                    className="flex-1 bg-emerald-400 rounded-t-sm"
                    style={{ height: `${Math.round(((d.leads * 100) / MAX_IMP) * 140)}px` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por plataforma */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 text-sm mb-5">Plataformas activas</h2>
          <div className="space-y-4">
            {[
              { name: 'Meta Ads', icon: '📘', color: 'bg-blue-500', pct: 62, leads: 31, spend: 368.40 },
              { name: 'Google Ads', icon: '🔍', color: 'bg-red-500', pct: 38, leads: 7, spend: 87.20 },
            ].map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{p.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{p.leads} leads</span>
                  <span>{p.spend.toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Conectar nueva plataforma</p>
            <div className="grid grid-cols-2 gap-2">
              {['TikTok Ads', 'LinkedIn Ads'].map(p => (
                <button key={p} className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-400 text-xs font-medium rounded-xl border border-slate-200 border-dashed transition-colors cursor-not-allowed">
                  + {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de campañas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Campañas</h2>
          <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-not-allowed">
            + Nueva campaña
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Campaña</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Presupuesto</th>
                <th className="px-4 py-3 text-right">Gastado</th>
                <th className="px-4 py-3 text-right">Impresiones</th>
                <th className="px-4 py-3 text-right">Clics</th>
                <th className="px-4 py-3 text-right">CTR</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">CPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {CAMPAIGNS.map(c => (
                <tr key={c.name} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.platformColor}`}>{c.platform}</span>
                      <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 pl-12">Inicio: {c.startDate}</p>
                  </td>
                  <td className="px-4 py-3.5">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600">{c.budget} €</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-900">{c.spent.toFixed(2)} €</span>
                    {c.budget > 0 && (
                      <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden w-16 ml-auto">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(100, (c.spent / c.budget) * 100)}%` }} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600">{c.impressions.toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600">{c.clicks.toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600">{c.ctr > 0 ? `${c.ctr}%` : '—'}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-emerald-700">{c.leads || '—'}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-slate-600">{c.cpl > 0 ? `${c.cpl.toFixed(2)} €` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
