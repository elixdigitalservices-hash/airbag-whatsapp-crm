const CATEGORIES = ['Todos', 'Teoría general', 'Señales', 'Maniobras', 'Normas de circulación', 'Examen tipo test']

const VIDEOS = [
  { id: 1, title: 'Señales de prohibición: las más importantes', category: 'Señales', duration: '8:24', views: 1243, progress: 100, thumb: 'from-orange-400 to-red-500', instructor: 'Carlos M.' },
  { id: 2, title: 'Cómo hacer la maniobra de aparcamiento en línea', category: 'Maniobras', duration: '12:05', views: 987, progress: 65, thumb: 'from-violet-400 to-purple-600', instructor: 'Laura D.' },
  { id: 3, title: 'Normas de prioridad en intersecciones', category: 'Normas de circulación', duration: '6:47', views: 2104, progress: 0, thumb: 'from-sky-400 to-blue-600', instructor: 'Carlos M.' },
  { id: 4, title: 'Examen tipo test: 50 preguntas (bloque A)', category: 'Examen tipo test', duration: '34:10', views: 3412, progress: 30, thumb: 'from-emerald-400 to-teal-600', instructor: 'Academia' },
  { id: 5, title: 'Señales de advertencia de peligro', category: 'Señales', duration: '9:18', views: 876, progress: 100, thumb: 'from-amber-400 to-orange-500', instructor: 'Laura D.' },
  { id: 6, title: 'Velocidades máximas según vía y vehículo', category: 'Teoría general', duration: '11:32', views: 1567, progress: 0, thumb: 'from-pink-400 to-rose-600', instructor: 'Carlos M.' },
  { id: 7, title: 'Maniobra de cambio de carril en autopista', category: 'Maniobras', duration: '7:55', views: 654, progress: 0, thumb: 'from-indigo-400 to-blue-600', instructor: 'Marcos R.' },
  { id: 8, title: 'Examen tipo test: bloque B — señales completo', category: 'Examen tipo test', duration: '28:44', views: 2890, progress: 80, thumb: 'from-teal-400 to-cyan-600', instructor: 'Academia' },
]

const FEATURED = VIDEOS[3]

export default function VideosPage() {
  return (
    <div className="p-8">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎬</span>
            <h1 className="text-xl font-bold text-white">Plataforma de Vídeos</h1>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
          <p className="text-slate-400 text-sm">Vídeos educativos del carnet de conducir, siempre disponibles para tus alumnos</p>
        </div>
        <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm font-semibold rounded-xl border border-orange-500/30 transition-colors cursor-not-allowed">
          Activar módulo →
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Vídeos publicados', value: '24', sub: '6 categorías', icon: '🎞️', color: 'border-orange-400', vc: 'text-orange-600' },
          { label: 'Alumnos activos', value: '156', sub: 'Viendo esta semana', icon: '👁️', color: 'border-violet-400', vc: 'text-violet-600' },
          { label: 'Horas visualizadas', value: '2.847', sub: 'Último mes', icon: '⏱️', color: 'border-sky-400', vc: 'text-sky-600' },
          { label: 'Tasa finalización', value: '78%', sub: '+5% vs mes anterior', icon: '📈', color: 'border-emerald-400', vc: 'text-emerald-600' },
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

      {/* Featured + lista */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Featured video player mockup */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`relative w-full h-64 bg-gradient-to-br ${FEATURED.thumb} flex items-center justify-center`}>
            <div className="absolute inset-0 bg-black/20" />
            {/* Play button */}
            <div className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-slate-900 border-b-[10px] border-b-transparent ml-1" />
            </div>
            {/* Duration */}
            <span className="absolute bottom-3 right-3 text-white text-xs font-bold bg-black/60 px-2 py-0.5 rounded">
              {FEATURED.duration}
            </span>
            {/* Category */}
            <span className="absolute top-3 left-3 text-white text-xs font-semibold bg-orange-500/90 px-2.5 py-1 rounded-full">
              {FEATURED.category}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-slate-900 text-base mb-1">{FEATURED.title}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
              <span>👁 {FEATURED.views.toLocaleString('es-ES')} visualizaciones</span>
              <span>🎙 {FEATURED.instructor}</span>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Tu progreso</span>
                <span>{FEATURED.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${FEATURED.progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Más vistos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">Más vistos</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {[...VIDEOS].sort((a, b) => b.views - a.views).slice(0, 5).map((v, i) => (
              <div key={v.id} className="px-4 py-3 flex items-center gap-3 hover:bg-orange-50/40 cursor-pointer transition-colors">
                <span className="text-sm font-black text-slate-300 w-4 flex-shrink-0">{i + 1}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${v.thumb} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{v.title}</p>
                  <p className="text-xs text-slate-400">{v.views.toLocaleString('es-ES')} vistas · {v.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros + grid de vídeos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-slate-900 text-sm">Biblioteca</h2>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat, i) => (
              <span
                key={cat}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
          {VIDEOS.map(v => (
            <div key={v.id} className="p-4 hover:bg-orange-50/30 cursor-pointer transition-colors group">
              <div className={`relative w-full h-28 rounded-xl bg-gradient-to-br ${v.thumb} mb-3 overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[13px] border-l-slate-900 border-b-[7px] border-b-transparent ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-white text-[10px] font-bold bg-black/50 px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
                {v.progress === 100 && (
                  <span className="absolute top-2 left-2 text-white text-[10px] font-bold bg-emerald-500/90 px-1.5 py-0.5 rounded-full">
                    ✓ Visto
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">{v.title}</p>
              <p className="text-[10px] text-slate-400">{v.category}</p>
              {v.progress > 0 && v.progress < 100 && (
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${v.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
