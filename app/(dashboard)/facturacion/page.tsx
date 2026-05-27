const INVOICES = [
  { id: 'FAC-2026-024', student: 'Pablo Jiménez', concept: 'Tasas DGT Práctica', amount: 94.05, tax: 0, date: '20/05/2026', status: 'sent', method: 'Stripe' },
  { id: 'FAC-2026-023', student: 'Alejandro Torres', concept: 'Tasas DGT Teoría', amount: 94.05, tax: 0, date: '15/04/2026', status: 'paid', method: 'Stripe' },
  { id: 'FAC-2026-022', student: 'Sofía Herrera', concept: 'Pack 20 clases + matrícula Carnet B', amount: 890.00, tax: 21, date: '15/01/2026', status: 'paid', method: 'Stripe' },
  { id: 'FAC-2026-021', student: 'Carmen Vega', concept: 'Pack 20 clases + matrícula Carnet B', amount: 890.00, tax: 21, date: '20/03/2026', status: 'paid', method: 'Bizum' },
  { id: 'FAC-2026-020', student: 'Iván Soler', concept: 'Tasas DGT Práctica', amount: 94.05, tax: 0, date: '10/01/2026', status: 'paid', method: 'Stripe' },
  { id: 'FAC-2026-019', student: 'Pablo Jiménez', concept: 'Tasas DGT Teoría', amount: 94.05, tax: 0, date: '01/03/2026', status: 'paid', method: 'Transferencia' },
  { id: 'FAC-2026-018', student: 'Pablo Jiménez', concept: 'Pack 20 clases + matrícula Carnet B', amount: 890.00, tax: 21, date: '10/12/2025', status: 'paid', method: 'Stripe' },
  { id: 'FAC-2025-017', student: 'Iván Soler', concept: 'Tasas DGT Teoría', amount: 94.05, tax: 0, date: '15/10/2025', status: 'paid', method: 'Efectivo' },
  { id: 'FAC-2026-025', student: 'Sofía Herrera', concept: 'Reconocimiento médico', amount: 45.00, tax: 21, date: null, status: 'pending', method: '—' },
]

const MONTHLY = [
  { month: 'Ene', amount: 1078 },
  { month: 'Feb', amount: 890 },
  { month: 'Mar', amount: 984 },
  { month: 'Abr', amount: 1068 },
  { month: 'May', amount: 1029 },
]

const MAX_MONTHLY = Math.max(...MONTHLY.map(m => m.amount))

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  paid: { label: 'Cobrada', color: 'bg-emerald-100 text-emerald-700' },
  sent: { label: 'Enviada', color: 'bg-sky-100 text-sky-700' },
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
}

const FEATURED = INVOICES[1]

export default function FacturacionPage() {
  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((a, i) => a + i.amount, 0)
  const totalPending = INVOICES.filter(i => i.status !== 'paid').reduce((a, i) => a + i.amount, 0)
  const totalTax = INVOICES.filter(i => i.status === 'paid' && i.tax > 0).reduce((a, i) => a + (i.amount - i.amount / (1 + i.tax / 100)), 0)

  return (
    <div className="p-8">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧾</span>
            <h1 className="text-xl font-bold text-white">Facturación</h1>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
          <p className="text-slate-400 text-sm">Genera, envía y descarga facturas directamente desde el CRM</p>
        </div>
        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-xl border border-orange-500/30 cursor-not-allowed">
          Activar módulo →
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Facturas emitidas', value: String(INVOICES.length), sub: 'Total histórico', icon: '📄', color: 'border-slate-300', vc: 'text-slate-900' },
          { label: 'Total facturado', value: `${(totalPaid + totalPending).toFixed(2)} €`, sub: 'Base imponible', icon: '💶', color: 'border-orange-400', vc: 'text-orange-600' },
          { label: 'IVA repercutido', value: `${totalTax.toFixed(2)} €`, sub: 'Sólo conceptos con IVA', icon: '📊', color: 'border-violet-400', vc: 'text-violet-600' },
          { label: 'Pendiente cobro', value: `${totalPending.toFixed(2)} €`, sub: `${INVOICES.filter(i => i.status !== 'paid').length} facturas`, icon: '⏳', color: 'border-amber-400', vc: 'text-amber-600' },
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
        {/* Gráfico mensual */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 text-sm mb-1">Facturación mensual</h2>
          <p className="text-xs text-slate-400 mb-5">2026 · Importe cobrado</p>
          <div className="flex items-end gap-2 h-32">
            {MONTHLY.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-600">{m.amount}€</span>
                <div
                  className="w-full bg-orange-500 rounded-t-lg hover:bg-orange-400 transition-colors"
                  style={{ height: `${Math.round((m.amount / MAX_MONTHLY) * 100)}px` }}
                />
                <span className="text-xs text-slate-400 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Total 2026</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{MONTHLY.reduce((a, m) => a + m.amount, 0).toLocaleString('es-ES')} €</p>
          </div>
        </div>

        {/* Invoice PDF preview */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Vista previa de factura</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-not-allowed">📥 Descargar PDF</button>
              <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-not-allowed">📤 Enviar por email</button>
            </div>
          </div>
          {/* PDF mockup */}
          <div className="p-5">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 font-mono" style={{ fontSize: '11px' }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
                    <span className="font-black text-slate-900 text-base tracking-tight">AIRBAG</span>
                  </div>
                  <p className="text-slate-500">Autoescuela Airbag S.L.</p>
                  <p className="text-slate-500">C/ Principal 12, Tomares, 41940 Sevilla</p>
                  <p className="text-slate-500">CIF: B-91234567</p>
                  <p className="text-slate-500">Tel: 954 123 456</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">FACTURA</p>
                  <p className="text-slate-600 mt-1">Nº {FEATURED.id}</p>
                  <p className="text-slate-500">Fecha: {FEATURED.date}</p>
                  <div className="mt-2 inline-block bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {STATUS_MAP[FEATURED.status].label}
                  </div>
                </div>
              </div>
              {/* Client */}
              <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1">FACTURAR A</p>
                <p className="font-bold text-slate-900 text-sm">{FEATURED.student}</p>
                <p className="text-slate-500">DNI: 28.456.789-X</p>
                <p className="text-slate-500">Tomares, 41940 Sevilla</p>
              </div>
              {/* Line items */}
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-slate-500 font-semibold text-[10px]">CONCEPTO</th>
                    <th className="text-right py-2 text-slate-500 font-semibold text-[10px]">IMPORTE</th>
                    <th className="text-right py-2 text-slate-500 font-semibold text-[10px]">IVA</th>
                    <th className="text-right py-2 text-slate-500 font-semibold text-[10px]">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 text-slate-800">{FEATURED.concept}</td>
                    <td className="py-2.5 text-right text-slate-700">
                      {FEATURED.tax > 0 ? (FEATURED.amount / (1 + FEATURED.tax / 100)).toFixed(2) : FEATURED.amount.toFixed(2)} €
                    </td>
                    <td className="py-2.5 text-right text-slate-500">{FEATURED.tax > 0 ? `${FEATURED.tax}%` : 'Exento'}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{FEATURED.amount.toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Base imponible</span>
                    <span>{FEATURED.tax > 0 ? (FEATURED.amount / (1 + FEATURED.tax / 100)).toFixed(2) : FEATURED.amount.toFixed(2)} €</span>
                  </div>
                  {FEATURED.tax > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>IVA ({FEATURED.tax}%)</span>
                      <span>{(FEATURED.amount - FEATURED.amount / (1 + FEATURED.tax / 100)).toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-900 text-sm border-t-2 border-slate-200 pt-1.5">
                    <span>TOTAL</span>
                    <span className="text-orange-600">{FEATURED.amount.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-slate-200 text-center text-slate-400 text-[9px]">
                Forma de pago: {FEATURED.method} · Gracias por confiar en Autoescuela Airbag
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla facturas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Todas las facturas</h2>
          <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-not-allowed">
            + Nueva factura
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Nº Factura</th>
                <th className="px-4 py-3 text-left">Alumno</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-right">Importe</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INVOICES.map(inv => {
                const st = STATUS_MAP[inv.status]
                return (
                  <tr key={inv.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">{inv.id}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{inv.student}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate">{inv.concept}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{inv.method}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">{inv.amount.toFixed(2)} €</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{inv.date ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs rounded-lg transition-colors cursor-not-allowed">PDF</button>
                        {inv.status !== 'paid' && (
                          <button className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs rounded-lg transition-colors cursor-not-allowed">Enviar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
