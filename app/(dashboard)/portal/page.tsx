const NOTIFICATIONS = [
  { icon: '📅', text: 'Tu próxima clase es mañana a las 10:00 con Carlos', time: 'hace 2h', unread: true },
  { icon: '✅', text: '¡Superaste el test de señales! Nota: 82/100', time: 'hace 1 día', unread: true },
  { icon: '💬', text: 'Tu instructor te ha enviado un mensaje', time: 'hace 2 días', unread: false },
  { icon: '📄', text: 'Nueva factura disponible para descargar', time: 'hace 3 días', unread: false },
]

const RECENT_ACTIVITY = [
  { date: 'Hoy', items: [{ type: 'class', text: 'Clase práctica 1h — Tomares centro', instructor: 'Carlos M.' }] },
  { date: 'Ayer', items: [{ type: 'test', text: 'Test de teoría completado', score: '82/100' }, { type: 'video', text: 'Vídeo visto: Señales de prohibición', duration: '8:24' }] },
  { date: '26 may', items: [{ type: 'class', text: 'Clase práctica 1h — Rotonda Espartinas', instructor: 'Carlos M.' }, { type: 'video', text: 'Vídeo visto: Normas en intersecciones', duration: '6:47' }] },
]

function PhoneMockup() {
  return (
    <div className="w-64 flex-shrink-0">
      {/* Phone frame */}
      <div className="relative mx-auto w-56 bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl ring-1 ring-slate-700">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: '520px' }}>
          {/* Status bar */}
          <div className="bg-orange-500 px-5 pt-7 pb-4">
            <p className="text-orange-200 text-[10px]">Autoescuela Airbag</p>
            <p className="text-white font-bold text-sm mt-0.5">Hola, Alejandro 👋</p>
          </div>
          {/* Content */}
          <div className="p-3 space-y-2 overflow-hidden">
            {/* Progress mini cards */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-orange-50 rounded-xl p-2.5">
                <p className="text-[9px] text-orange-600 font-semibold">TEORÍA</p>
                <p className="text-base font-black text-orange-700">80%</p>
                <div className="h-1 bg-orange-200 rounded-full mt-1"><div className="h-full bg-orange-500 rounded-full w-4/5" /></div>
              </div>
              <div className="bg-violet-50 rounded-xl p-2.5">
                <p className="text-[9px] text-violet-600 font-semibold">PRÁCTICAS</p>
                <p className="text-base font-black text-violet-700">14/20h</p>
                <div className="h-1 bg-violet-200 rounded-full mt-1"><div className="h-full bg-violet-500 rounded-full w-3/4" /></div>
              </div>
            </div>
            {/* Next class */}
            <div className="bg-slate-900 rounded-xl p-3">
              <p className="text-[9px] text-slate-400 font-semibold">PRÓXIMA CLASE</p>
              <p className="text-white font-bold text-xs mt-0.5">Mañana — 10:00</p>
              <p className="text-slate-400 text-[9px]">Carlos M. · Seat Ibiza</p>
            </div>
            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-1">
              {[{ icon: '📅', label: 'Reservar' }, { icon: '🎬', label: 'Vídeos' }, { icon: '🧾', label: 'Facturas' }].map(a => (
                <div key={a.label} className="bg-slate-50 rounded-xl p-2 flex flex-col items-center gap-1">
                  <span className="text-base">{a.icon}</span>
                  <span className="text-[8px] font-semibold text-slate-600">{a.label}</span>
                </div>
              ))}
            </div>
            {/* Notifications */}
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide px-1">Notificaciones</p>
              {NOTIFICATIONS.slice(0, 2).map((n, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${n.unread ? 'bg-orange-50' : 'bg-slate-50'}`}>
                  <span className="text-sm">{n.icon}</span>
                  <p className="text-[9px] text-slate-700 leading-snug">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Home button */}
        <div className="w-16 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">Vista móvil del alumno</p>
    </div>
  )
}

export default function PortalPage() {
  return (
    <div className="p-8">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📱</span>
            <h1 className="text-xl font-bold text-white">Portal del Alumno</h1>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
          <p className="text-slate-400 text-sm">Cada alumno accede a su progreso, reservas y facturas desde su móvil</p>
        </div>
        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-xl border border-orange-500/30 cursor-not-allowed">
          Activar portal →
        </button>
      </div>

      {/* Vista previa label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">Vista previa — alumno: Alejandro Torres</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="flex gap-6 items-start">
        {/* Main portal view */}
        <div className="flex-1 space-y-5">
          {/* Welcome header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl px-6 py-6 flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">Bienvenido de nuevo</p>
              <h2 className="text-2xl font-black text-white mt-0.5">Hola, Alejandro 👋</h2>
              <p className="text-orange-200 text-sm mt-1">Llevas 14 clases prácticas. ¡Ya casi estás listo!</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              🚗
            </div>
          </div>

          {/* Progress cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Horas de teoría', value: '24h', total: 'de 30h', pct: 80, color: 'orange', icon: '📚', sub: 'Test aprobado ✓' },
              { label: 'Clases prácticas', value: '14h', total: 'de 20h', pct: 70, color: 'violet', icon: '🚗', sub: '6 horas para el examen' },
              { label: 'Examen teoría', value: 'APTO', total: '22/04/2026', pct: 100, color: 'emerald', icon: '🎯', sub: 'Primer intento ✓' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500">{c.label}</p>
                  <span className="text-xl">{c.icon}</span>
                </div>
                <p className={`text-2xl font-black ${c.color === 'orange' ? 'text-orange-600' : c.color === 'violet' ? 'text-violet-600' : 'text-emerald-600'}`}>
                  {c.value}
                </p>
                <p className="text-xs text-slate-400 mb-2">{c.total}</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.color === 'orange' ? 'bg-orange-500' : c.color === 'violet' ? 'bg-violet-500' : 'bg-emerald-500'}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Próxima clase + acciones rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-slate-900 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">📅</div>
              <div className="flex-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Próxima clase</p>
                <p className="text-white font-bold text-base mt-0.5">Mañana, 29 mayo — 10:00h</p>
                <p className="text-slate-400 text-sm">Carlos Moreno · Seat Ibiza GR-1234-AB</p>
                <p className="text-orange-400 text-xs mt-1">Punto de encuentro: Autoescuela Airbag, Tomares</p>
              </div>
              <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-semibold rounded-xl border border-orange-500/30 transition-colors cursor-not-allowed flex-shrink-0">
                Cancelar
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Acciones rápidas</p>
              <div className="space-y-2">
                {[
                  { icon: '📅', label: 'Reservar clase' },
                  { icon: '🎬', label: 'Ver vídeos' },
                  { icon: '🧾', label: 'Mis facturas' },
                  { icon: '💬', label: 'Contactar' },
                ].map(a => (
                  <button key={a.label} className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-orange-50 rounded-xl text-sm font-medium text-slate-700 hover:text-orange-700 transition-colors cursor-not-allowed">
                    <span>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Actividad reciente</h3>
              <div className="flex items-center gap-2">
                {NOTIFICATIONS.filter(n => n.unread).length > 0 && (
                  <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {NOTIFICATIONS.filter(n => n.unread).length}
                  </span>
                )}
                <span className="text-xs text-slate-400">Notificaciones</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className={`flex items-start gap-3 px-5 py-3 ${n.unread ? 'bg-orange-50/50' : ''}`}>
                  <span className="text-lg flex-shrink-0">{n.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                  {n.unread && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phone mockup */}
        <PhoneMockup />
      </div>
    </div>
  )
}
