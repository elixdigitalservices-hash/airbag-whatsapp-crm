'use client'

import { useState } from 'react'

const STUDENTS = [
  {
    id: '1', name: 'Alejandro Torres', initials: 'AT', color: 'bg-orange-100 text-orange-700',
    dni: '28.456.789-X', phone: '654 321 098', email: 'alex.torres@gmail.com',
    birthdate: '12/03/1998', address: 'C/ Girasol 14, Tomares', license: 'Carnet B',
    enrolled: '03/02/2026', status: 'active',
    theory: { done: 24, total: 30, tests: [{ date: '10/03', score: 68, pass: false }, { date: '24/03', score: 74, pass: false }, { date: '14/04', score: 82, pass: true }] },
    practice: { done: 14, total: 20, instructor: 'Carlos Moreno', vehicle: 'Seat Ibiza GR-1234-AB' },
    exams: [{ type: 'Teoría DGT', date: '22/04/2026', result: 'APTO', attempt: '1er intento' }, { type: 'Práctica DGT', date: null, result: null, attempt: 'Pendiente' }],
    docs: [{ name: 'DNI / NIE', ok: true }, { name: 'Foto carnet', ok: true }, { name: 'Reconocimiento médico', ok: true }, { name: 'Solicitud DGT', ok: true }, { name: 'Justificante tasas', ok: false }, { name: 'Contrato matrícula', ok: true }],
    payments: [{ concept: 'Pack 20 clases + matrícula', amount: 890, date: '03/02/2026', paid: true }, { concept: 'Tasas DGT Teoría', amount: 94.05, date: '15/04/2026', paid: true }, { concept: 'Tasas DGT Práctica', amount: 94.05, date: null, paid: false }],
    note: 'Alumno responsable y puntual. Examen práctico pendiente para junio 2026.',
  },
  {
    id: '2', name: 'Sofía Herrera', initials: 'SH', color: 'bg-violet-100 text-violet-700',
    dni: '30.112.456-B', phone: '612 987 654', email: 'sofia.herrera@gmail.com',
    birthdate: '08/07/2001', address: 'Av. Blas Infante 32, Bormujos', license: 'Carnet B',
    enrolled: '15/01/2026', status: 'active',
    theory: { done: 18, total: 30, tests: [{ date: '01/03', score: 55, pass: false }, { date: '20/03', score: 61, pass: false }] },
    practice: { done: 8, total: 20, instructor: 'Laura Díaz', vehicle: 'Ford Focus SE-5678-BC' },
    exams: [{ type: 'Teoría DGT', date: null, result: null, attempt: 'Pendiente' }, { type: 'Práctica DGT', date: null, result: null, attempt: 'Pendiente' }],
    docs: [{ name: 'DNI / NIE', ok: true }, { name: 'Foto carnet', ok: false }, { name: 'Reconocimiento médico', ok: false }, { name: 'Solicitud DGT', ok: false }, { name: 'Justificante tasas', ok: false }, { name: 'Contrato matrícula', ok: true }],
    payments: [{ concept: 'Pack 20 clases + matrícula', amount: 890, date: '15/01/2026', paid: true }],
    note: 'Alumna nueva, falta documentación médica. Contactar para recordatorio.',
  },
  {
    id: '3', name: 'Pablo Jiménez', initials: 'PJ', color: 'bg-emerald-100 text-emerald-700',
    dni: '29.987.001-K', phone: '666 543 210', email: 'pablo.jimenez@hotmail.com',
    birthdate: '25/11/1999', address: 'C/ Real 8, Espartinas', license: 'Carnet B',
    enrolled: '10/12/2025', status: 'exam_ready',
    theory: { done: 30, total: 30, tests: [{ date: '15/01', score: 70, pass: false }, { date: '05/02', score: 79, pass: true }] },
    practice: { done: 19, total: 20, instructor: 'Carlos Moreno', vehicle: 'Seat Ibiza GR-1234-AB' },
    exams: [{ type: 'Teoría DGT', date: '08/03/2026', result: 'APTO', attempt: '2º intento' }, { type: 'Práctica DGT', date: '30/05/2026', result: null, attempt: 'Solicitado' }],
    docs: [{ name: 'DNI / NIE', ok: true }, { name: 'Foto carnet', ok: true }, { name: 'Reconocimiento médico', ok: true }, { name: 'Solicitud DGT', ok: true }, { name: 'Justificante tasas', ok: true }, { name: 'Contrato matrícula', ok: true }],
    payments: [{ concept: 'Pack 20 clases + matrícula', amount: 890, date: '10/12/2025', paid: true }, { concept: 'Tasas DGT Teoría', amount: 94.05, date: '01/03/2026', paid: true }, { concept: 'Tasas DGT Práctica', amount: 94.05, date: '20/05/2026', paid: true }],
    note: 'Todo en regla. Examen práctico el 30/05. Muy buenas aptitudes al volante.',
  },
  {
    id: '4', name: 'Carmen Vega', initials: 'CV', color: 'bg-sky-100 text-sky-700',
    dni: '45.320.887-M', phone: '677 890 123', email: 'cvega94@gmail.com',
    birthdate: '14/06/1994', address: 'C/ Molino 5, Gines', license: 'Carnet B',
    enrolled: '20/03/2026', status: 'active',
    theory: { done: 8, total: 30, tests: [] },
    practice: { done: 3, total: 20, instructor: 'Laura Díaz', vehicle: 'Ford Focus SE-5678-BC' },
    exams: [{ type: 'Teoría DGT', date: null, result: null, attempt: 'Pendiente' }, { type: 'Práctica DGT', date: null, result: null, attempt: 'Pendiente' }],
    docs: [{ name: 'DNI / NIE', ok: true }, { name: 'Foto carnet', ok: true }, { name: 'Reconocimiento médico', ok: false }, { name: 'Solicitud DGT', ok: false }, { name: 'Justificante tasas', ok: false }, { name: 'Contrato matrícula', ok: true }],
    payments: [{ concept: 'Pack 20 clases + matrícula', amount: 890, date: '20/03/2026', paid: true }],
    note: 'Alumna reciente. Ritmo de progreso lento, reforzar teoría.',
  },
  {
    id: '5', name: 'Iván Soler', initials: 'IS', color: 'bg-pink-100 text-pink-700',
    dni: '31.456.780-Z', phone: '699 012 345', email: 'ivansoler@yahoo.es',
    birthdate: '03/09/1996', address: 'Av. Los Pinos 21, Tomares', license: 'Carnet B',
    enrolled: '05/09/2025', status: 'graduated',
    theory: { done: 30, total: 30, tests: [{ date: '10/10', score: 85, pass: true }] },
    practice: { done: 20, total: 20, instructor: 'Marcos Ruiz', vehicle: 'Renault Clio SE-9012-CD' },
    exams: [{ type: 'Teoría DGT', date: '20/10/2025', result: 'APTO', attempt: '1er intento' }, { type: 'Práctica DGT', date: '15/01/2026', result: 'APTO', attempt: '1er intento' }],
    docs: [{ name: 'DNI / NIE', ok: true }, { name: 'Foto carnet', ok: true }, { name: 'Reconocimiento médico', ok: true }, { name: 'Solicitud DGT', ok: true }, { name: 'Justificante tasas', ok: true }, { name: 'Contrato matrícula', ok: true }],
    payments: [{ concept: 'Pack 20 clases + matrícula', amount: 890, date: '05/09/2025', paid: true }, { concept: 'Tasas DGT Teoría', amount: 94.05, date: '15/10/2025', paid: true }, { concept: 'Tasas DGT Práctica', amount: 94.05, date: '10/01/2026', paid: true }],
    note: 'Alumno graduado. Carnet obtenido enero 2026. Perfil ejemplar.',
  },
]

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'En curso', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  exam_ready: { label: 'Listo para examen', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  graduated: { label: 'Graduado', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
}

export default function ExpedientesPage() {
  const [sel, setSel] = useState(STUDENTS[0])

  const docsOk = sel.docs.filter(d => d.ok).length
  const theoryPct = Math.round((sel.theory.done / sel.theory.total) * 100)
  const practicePct = Math.round((sel.practice.done / sel.practice.total) * 100)
  const totalPaid = sel.payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
  const totalPending = sel.payments.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0)

  return (
    <div className="p-8">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🗂️</span>
            <h1 className="text-xl font-bold text-white">Expedientes de Alumnos</h1>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
          <p className="text-slate-400 text-sm">Ficha completa: documentación, teoría, prácticas, exámenes y pagos</p>
        </div>
        <button className="px-4 py-2 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-xl border border-orange-500/30 cursor-not-allowed">
          Activar módulo →
        </button>
      </div>

      <div className="flex gap-5 items-start">
        {/* Lista alumnos */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input placeholder="Buscar alumno..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400" readOnly />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {STUDENTS.map(s => {
              const st = STATUS_MAP[s.status]
              const isSelected = sel.id === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSel(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.color}`}>
                    {s.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-700' : 'text-slate-900'}`}>{s.name}</p>
                    <p className="text-xs text-slate-400">{s.license}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Detalle */}
        <div className="flex-1 space-y-4">
          {/* Header alumno */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${sel.color}`}>
                  {sel.initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{sel.name}</h2>
                  <p className="text-slate-500 text-sm">{sel.dni} · {sel.birthdate} · {sel.license}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{sel.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[sel.status].color}`}>
                  {STATUS_MAP[sel.status].label}
                </span>
                <span className="text-xs text-slate-400">Matrícula: {sel.enrolled}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { label: 'Teoría', value: `${theoryPct}%`, sub: `${sel.theory.done}/${sel.theory.total}h`, color: 'text-orange-600' },
                { label: 'Prácticas', value: `${practicePct}%`, sub: `${sel.practice.done}/${sel.practice.total}h`, color: 'text-violet-600' },
                { label: 'Documentos', value: `${docsOk}/${sel.docs.length}`, sub: docsOk === sel.docs.length ? '✓ Completo' : 'Faltan docs', color: docsOk === sel.docs.length ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Pagado', value: `${totalPaid.toFixed(0)} €`, sub: totalPending > 0 ? `${totalPending.toFixed(2)} € pendiente` : '✓ Al día', color: totalPending > 0 ? 'text-red-600' : 'text-emerald-600' },
              ].map(c => (
                <div key={c.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Documentación */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Documentación</h3>
              <div className="space-y-2">
                {sel.docs.map(d => (
                  <div key={d.name} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${d.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {d.ok ? '✓' : '!'}
                    </div>
                    <span className={`text-sm ${d.ok ? 'text-slate-700' : 'text-amber-700 font-medium'}`}>{d.name}</span>
                    {!d.ok && <span className="text-xs text-amber-500 ml-auto">Pendiente</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso teoría */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Progreso teórico</h3>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Horas completadas</span><span className="font-semibold">{sel.theory.done}/{sel.theory.total}h</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${theoryPct}%` }} />
                </div>
              </div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Tests realizados</h4>
              {sel.theory.tests.length === 0 ? (
                <p className="text-xs text-slate-400">Sin tests aún</p>
              ) : (
                <div className="space-y-1.5">
                  {sel.theory.tests.map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-12">{t.date}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${t.pass ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${t.score}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-8 text-right ${t.pass ? 'text-emerald-600' : 'text-red-500'}`}>{t.score}</span>
                      <span className={`text-xs w-12 ${t.pass ? 'text-emerald-600' : 'text-red-400'}`}>{t.pass ? 'APTO' : 'No apto'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Exámenes DGT */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Exámenes DGT</h3>
              <div className="space-y-3">
                {sel.exams.map((e, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${e.result === 'APTO' ? 'border-emerald-200 bg-emerald-50' : e.result === 'NO APTO' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{e.type}</p>
                      <p className="text-xs text-slate-400">{e.date ?? 'Fecha por determinar'} · {e.attempt}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${e.result === 'APTO' ? 'bg-emerald-500 text-white' : e.result === 'NO APTO' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {e.result ?? 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Horas prácticas</span><span className="font-semibold">{sel.practice.done}/{sel.practice.total}h</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${practicePct}%` }} />
                </div>
                <p className="text-xs text-slate-400">Instructor: <span className="font-medium text-slate-600">{sel.practice.instructor}</span></p>
                <p className="text-xs text-slate-400">Vehículo: <span className="font-medium text-slate-600">{sel.practice.vehicle}</span></p>
              </div>
            </div>

            {/* Pagos + nota */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Pagos</h3>
                <div className="space-y-2">
                  {sel.payments.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${p.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                        {p.paid ? '✓' : '€'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 truncate">{p.concept}</p>
                        <p className="text-[10px] text-slate-400">{p.date ?? 'Sin fecha'}</p>
                      </div>
                      <span className={`text-xs font-bold flex-shrink-0 ${p.paid ? 'text-emerald-700' : 'text-red-500'}`}>{p.amount.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              {sel.note && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-orange-700 mb-1">📝 Nota del instructor</p>
                  <p className="text-sm text-slate-700">{sel.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
