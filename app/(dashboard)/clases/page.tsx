const INSTRUCTORS = [
  { name: 'Carlos Moreno', initials: 'CM', color: 'bg-orange-100 text-orange-700', vehicle: 'Seat Ibiza · GR-1234-AB', hours: 312, rating: 4.9, active: true },
  { name: 'Laura Díaz', initials: 'LD', color: 'bg-violet-100 text-violet-700', vehicle: 'Ford Focus · SE-5678-BC', hours: 278, rating: 4.8, active: true },
  { name: 'Marcos Ruiz', initials: 'MR', color: 'bg-sky-100 text-sky-700', vehicle: 'Renault Clio · SE-9012-CD', hours: 195, rating: 4.7, active: false },
]

const STUDENTS = [
  { name: 'Alejandro Torres', done: 14, total: 20, next: 'Mañana 10:00', instructor: 'Carlos M.', status: 'on_track' },
  { name: 'Sofía Herrera', done: 8, total: 20, next: 'Hoy 17:30', instructor: 'Laura D.', status: 'urgent' },
  { name: 'Pablo Jiménez', done: 19, total: 20, next: 'Vie 09:00', instructor: 'Carlos M.', status: 'almost' },
  { name: 'Carmen Vega', done: 3, total: 20, next: 'Jue 11:00', instructor: 'Laura D.', status: 'on_track' },
  { name: 'Iván Soler', done: 20, total: 20, next: '—', instructor: 'Marcos R.', status: 'done' },
  { name: 'María Castillo', done: 11, total: 20, next: 'Sáb 10:30', instructor: 'Laura D.', status: 'on_track' },
]

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S']
const HOURS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00']

const SLOTS: Record<string, { name: string; color: string }> = {
  'L-09:00': { name: 'Alejandro T.', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'L-10:00': { name: 'Pablo J.', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'M-17:30': { name: 'Sofía H.', color: 'bg-red-100 text-red-700 border-red-200' },
  'X-11:00': { name: 'Carmen V.', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  'X-17:00': { name: 'María C.', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  'J-09:00': { name: 'Iván S.', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'V-09:00': { name: 'Pablo J.', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'S-10:00': { name: 'María C.', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  'M-10:00': { name: 'Alejandro T.', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'J-16:00': { name: 'Carmen V.', color: 'bg-violet-100 text-violet-700 border-violet-200' },
}

function statusConfig(s: string) {
  if (s === 'urgent') return { label: 'Pocas horas', color: 'bg-red-100 text-red-700' }
  if (s === 'almost') return { label: 'Casi listo', color: 'bg-emerald-100 text-emerald-700' }
  if (s === 'done') return { label: 'Completado', color: 'bg-slate-100 text-slate-500' }
  return { label: 'En curso', color: 'bg-orange-100 text-orange-700' }
}

export default function ClasesPage() {
  return (
    <div className="p-8">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🚗</span>
            <h1 className="text-xl font-bold text-white">Gestión de Clases Prácticas</h1>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
          <p className="text-slate-400 text-sm">Agenda, instructores y progreso de alumnos en un solo lugar</p>
        </div>
        <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm font-semibold rounded-xl border border-orange-500/30 transition-colors cursor-not-allowed">
          Activar módulo →
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Clases esta semana', value: '24', sub: '+3 vs semana pasada', icon: '📅', color: 'border-orange-400', vc: 'text-orange-600' },
          { label: 'Horas completadas', value: '847', sub: 'De 1.200 programadas', icon: '⏱️', color: 'border-violet-400', vc: 'text-violet-600' },
          { label: 'Alumnos activos', value: '31', sub: '6 finalizan este mes', icon: '🎓', color: 'border-sky-400', vc: 'text-sky-600' },
          { label: 'Tasa finalización', value: '94%', sub: 'Último trimestre', icon: '✅', color: 'border-emerald-400', vc: 'text-emerald-600' },
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

      <div className="grid grid-cols-3 gap-6">
        {/* Calendario semanal */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Agenda semanal</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">← Ant.</button>
              <span className="font-semibold text-slate-700">26 may – 1 jun 2026</span>
              <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">Sig. →</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold w-16">Hora</th>
                  {WEEK.map(d => (
                    <th key={d} className="px-2 py-2 text-center text-slate-600 font-bold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {HOURS.map(h => (
                  <tr key={h} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 text-slate-400 font-medium">{h}</td>
                    {WEEK.map(d => {
                      const key = `${d}-${h}`
                      const slot = SLOTS[key]
                      return (
                        <td key={d} className="px-1 py-1.5 text-center">
                          {slot ? (
                            <div className={`rounded-lg border px-2 py-1 text-[10px] font-semibold leading-tight ${slot.color}`}>
                              {slot.name}
                            </div>
                          ) : (
                            <div className="h-6" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructores */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Instructores</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {INSTRUCTORS.map(ins => (
                <div key={ins.name} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ins.color}`}>
                    {ins.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{ins.name}</p>
                    <p className="text-xs text-slate-400 truncate">{ins.vehicle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700">{ins.hours}h</p>
                    <p className="text-xs text-amber-500">★ {ins.rating}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ins.active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Próximas clases */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Hoy</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { time: '10:00', student: 'Alejandro T.', instructor: 'Carlos M.', zone: 'Tomares' },
                { time: '11:30', student: 'Pablo J.', instructor: 'Carlos M.', zone: 'Bormujos' },
                { time: '17:30', student: 'Sofía H.', instructor: 'Laura D.', zone: 'Tomares' },
                { time: '19:00', student: 'María C.', instructor: 'Laura D.', zone: 'Espartinas' },
              ].map(c => (
                <div key={c.time} className="px-5 py-2.5 flex items-center gap-3">
                  <span className="text-xs font-bold text-orange-600 w-10 flex-shrink-0">{c.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{c.student}</p>
                    <p className="text-xs text-slate-400">{c.instructor} · {c.zone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progreso alumnos */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm">Progreso de alumnos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Alumno</th>
                <th className="px-4 py-3 text-left">Progreso</th>
                <th className="px-4 py-3 text-left">Instructor</th>
                <th className="px-4 py-3 text-left">Próxima clase</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STUDENTS.map(s => {
                const pct = Math.round((s.done / s.total) * 100)
                const sc = statusConfig(s.status)
                return (
                  <tr key={s.name} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{s.name}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{s.done}/{s.total}h</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{s.instructor}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-medium">{s.next}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
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
