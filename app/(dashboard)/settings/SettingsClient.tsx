'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Service, Promotion } from '@/types'

const TABS = [
  { id: 'general', label: 'General', icon: '🏫' },
  { id: 'servicios', label: 'Servicios', icon: '🎓' },
  { id: 'promociones', label: 'Promociones', icon: '🏷️' },
  { id: 'bot', label: 'Bot & IA', icon: '🤖' },
]

const INPUT = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white placeholder-slate-400 transition-shadow'
const LABEL = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'
const BTN_PRIMARY = 'px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all shadow-sm'
const BTN_SECONDARY = 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors'
const BTN_DANGER = 'px-3 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xl transition-colors'

// ── General tab ──────────────────────────────────────────────────────────────

function GeneralTab({ init, demoMode }: { init: Record<string, string>; demoMode: boolean }) {
  const [values, setValues] = useState(init)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const FIELDS: { key: string; label: string; type: string; placeholder: string; rows?: number }[] = [
    { key: 'school_name', label: 'Nombre de la autoescuela', type: 'text', placeholder: 'Autoescuela Airbag' },
    { key: 'school_phone', label: 'Teléfono', type: 'text', placeholder: '954 000 000' },
    { key: 'school_email', label: 'Email', type: 'email', placeholder: 'info@airbag.com' },
    { key: 'school_address', label: 'Dirección', type: 'text', placeholder: 'C/ Principal 12, Tomares' },
    { key: 'school_hours', label: 'Horario', type: 'text', placeholder: 'L-V 9:00-14:00 / 16:00-20:00' },
    { key: 'school_web', label: 'Página web', type: 'url', placeholder: 'https://airbag.com' },
    { key: 'school_description', label: 'Descripción de la autoescuela', type: 'textarea', rows: 3, placeholder: 'Ej: Autoescuela especializada en carnet de coche y moto en Tomares. Clases con vehículos modernos y profesores con más de 15 años de experiencia...' },
    { key: 'school_differentiators', label: 'Puntos diferenciales', type: 'textarea', rows: 2, placeholder: 'Ej: Aprobamos el 85% de alumnos a la primera · Clases en fin de semana · Sin letra pequeña en el precio' },
  ]

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (demoMode) { setSaved(true); setTimeout(() => setSaved(false), 2000); return }
    setSaving(true)
    const upserts = FIELDS.map(f => ({ key: f.key, value: JSON.stringify(values[f.key] ?? ''), updated_at: new Date().toISOString() }))
    await supabase.from('settings').upsert(upserts, { onConflict: 'key' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fullWidthKeys = new Set(['school_name', 'school_address', 'school_description', 'school_differentiators'])

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
      {demoMode && <DemoBanner />}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-sm mb-5">Datos de la autoescuela</h3>
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.key} className={fullWidthKeys.has(f.key) ? 'col-span-2' : ''}>
              <label className={LABEL}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={values[f.key] ?? ''} placeholder={f.placeholder} rows={f.rows ?? 3}
                  onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                  className={`${INPUT} resize-y`} />
              ) : (
                <input type={f.type} value={values[f.key] ?? ''} placeholder={f.placeholder}
                  onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                  className={INPUT} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className={BTN_PRIMARY}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-semibold">✓ Guardado</span>}
      </div>
    </form>
  )
}

// ── Bot & IA tab ──────────────────────────────────────────────────────────────

interface KbEntry { title: string; content: string }

function BotTab({ init, demoMode }: { init: Record<string, string>; demoMode: boolean }) {
  const [values, setValues] = useState(init)
  const [active, setActive] = useState(init.chatbot_active === 'true')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [kb, setKb] = useState<KbEntry[]>(() => {
    try { return JSON.parse(init.knowledge_base ?? '[]') } catch { return [] }
  })
  const [newEntry, setNewEntry] = useState<KbEntry>({ title: '', content: '' })
  const [addingEntry, setAddingEntry] = useState(false)
  const supabase = createClient()

  const MSG_FIELDS = [
    { key: 'welcome_message', label: 'Mensaje de bienvenida', rows: 4, hint: 'Primera respuesta que envía el bot' },
    { key: 'handoff_message', label: 'Mensaje de derivación humana', rows: 3, hint: 'Se envía cuando el bot escala a un agente humano' },
  ]

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (demoMode) { setSaved(true); setTimeout(() => setSaved(false), 2000); return }
    setSaving(true)
    const upserts = [
      ...MSG_FIELDS.map(f => ({ key: f.key, value: JSON.stringify(values[f.key] ?? ''), updated_at: new Date().toISOString() })),
      { key: 'chatbot_active', value: JSON.stringify(active), updated_at: new Date().toISOString() },
      { key: 'system_prompt', value: JSON.stringify(values['system_prompt'] ?? ''), updated_at: new Date().toISOString() },
      { key: 'knowledge_base', value: JSON.stringify(kb), updated_at: new Date().toISOString() },
    ]
    await supabase.from('settings').upsert(upserts, { onConflict: 'key' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
      {demoMode && <DemoBanner />}

      {/* Toggle */}
      <div className={`rounded-2xl border-2 p-5 transition-colors ${active ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">Chatbot activo</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {active ? 'El bot responde automáticamente por WhatsApp' : 'Bot detenido — los mensajes llegan pero no hay respuesta automática'}
            </p>
          </div>
          <button type="button" onClick={() => setActive(v => !v)}
            className={`relative inline-flex w-14 h-7 rounded-full transition-colors shadow-inner ${active ? 'bg-orange-500' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          <span className={`text-xs font-semibold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
            {active ? 'Operativo' : 'Detenido'}
          </span>
        </div>
      </div>

      {/* Prompt Maestro */}
      <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-sm p-6 space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Prompt Maestro</h3>
          <p className="text-xs text-slate-400 mt-0.5">Define la personalidad, tono y reglas del bot. Si está vacío se usan las instrucciones por defecto.</p>
        </div>
        <textarea
          value={values['system_prompt'] ?? ''}
          onChange={e => setValues(p => ({ ...p, system_prompt: e.target.value }))}
          rows={10}
          placeholder={`Ejemplo:\nEres el asistente de ventas de Autoescuela Airbag. Tu tono es cercano, profesional y en español. Siempre responde con empatía...\n\nPuedes añadir aquí reglas específicas, frases prohibidas, cómo tratar objeciones de precio, etc.`}
          className={`${INPUT} resize-y font-mono text-xs leading-relaxed`}
        />
        <p className="text-xs text-slate-400">💡 Esto se añade al inicio de cada conversación. Sé específico: tono, qué ofrecer primero, cómo manejar el precio, cuándo derivar.</p>
      </div>

      {/* Base de Conocimiento */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Base de Conocimiento</h3>
          <p className="text-xs text-slate-400 mt-0.5">Bloques de info que el bot conoce: precios extra, profesores, cómo pedir cita, examen médico, FAQs…</p>
        </div>

        <div className="space-y-3">
          {kb.map((entry, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-900">{entry.title}</p>
                <button type="button" onClick={() => setKb(k => k.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium flex-shrink-0">
                  Eliminar
                </button>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            </div>
          ))}
          {kb.length === 0 && !addingEntry && (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
              <p className="text-2xl mb-2">📚</p>
              <p className="text-sm text-slate-400">Sin entradas — añade info que el bot debe conocer</p>
            </div>
          )}
        </div>

        {addingEntry ? (
          <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50/30 space-y-3">
            <div>
              <label className={LABEL}>Título</label>
              <input value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))}
                placeholder="Ej: Cómo reservar clase práctica"
                className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Contenido</label>
              <textarea value={newEntry.content} onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))}
                rows={4} placeholder="Escribe aquí la información que debe conocer el bot..."
                className={`${INPUT} resize-y`} />
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => {
                  if (!newEntry.title.trim() || !newEntry.content.trim()) return
                  setKb(k => [...k, { title: newEntry.title.trim(), content: newEntry.content.trim() }])
                  setNewEntry({ title: '', content: '' })
                  setAddingEntry(false)
                }}
                className={BTN_PRIMARY}>Añadir</button>
              <button type="button" onClick={() => { setAddingEntry(false); setNewEntry({ title: '', content: '' }) }}
                className={BTN_SECONDARY}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAddingEntry(true)} className={BTN_SECONDARY}>
            + Añadir entrada
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-slate-900 text-sm">Mensajes del bot</h3>
        {MSG_FIELDS.map(f => (
          <div key={f.key}>
            <label className={LABEL}>{f.label}</label>
            <p className="text-xs text-slate-400 mb-2">{f.hint}</p>
            <textarea value={values[f.key] ?? ''} rows={f.rows}
              onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
              className={`${INPUT} resize-y font-mono text-xs`} />
          </div>
        ))}
      </div>

      {/* Modelo IA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Modelo de IA</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'gpt-4o-mini', label: 'GPT-4o mini', desc: 'Rápido, preciso y económico · Activo', active: true },
            { id: 'gpt-4o', label: 'GPT-4o', desc: 'Máxima capacidad · Próximamente', active: false },
          ].map(m => (
            <div key={m.id} className={`p-4 rounded-xl border-2 cursor-default transition-colors ${m.active ? 'border-orange-400 bg-orange-50' : 'border-slate-200 opacity-60'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">{m.label}</p>
                {m.active && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">Activo</span>}
              </div>
              <p className="text-xs text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className={BTN_PRIMARY}>
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-semibold">✓ Guardado</span>}
      </div>
    </form>
  )
}

// ── Services tab ──────────────────────────────────────────────────────────────

function ServiceForm({ service, onSave, onCancel }: { service?: Partial<Service>; onSave: () => void; onCancel: () => void }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: service?.name ?? '', category: service?.category ?? '',
    price: service?.price?.toString() ?? '', short_description: service?.short_description ?? '',
    includes: (service?.includes ?? []).join('\n'), payment_link: service?.payment_link ?? '',
    active: service?.active ?? true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload = {
      name: form.name, category: form.category || null,
      price: form.price ? parseFloat(form.price) : null,
      short_description: form.short_description || null,
      includes: form.includes ? form.includes.split('\n').map(s => s.trim()).filter(Boolean) : null,
      payment_link: form.payment_link || null, active: form.active,
      updated_at: new Date().toISOString(),
    }
    if (service?.id) await supabase.from('services').update(payload).eq('id', service.id)
    else await supabase.from('services').insert(payload)
    setSaving(false); onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className={LABEL}>Nombre</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className={INPUT} /></div>
        <div><label className={LABEL}>Categoría</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={INPUT}>
            <option value="">Sin categoría</option>
            <option value="coche">Coche</option><option value="moto">Moto</option><option value="otro">Otro</option>
          </select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={LABEL}>Precio (€)</label>
          <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className={INPUT} /></div>
        <div><label className={LABEL}>Link de pago</label>
          <input value={form.payment_link} onChange={e => setForm(p => ({ ...p, payment_link: e.target.value }))} className={INPUT} /></div>
      </div>
      <div><label className={LABEL}>Descripción corta</label>
        <input value={form.short_description} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))} className={INPUT} /></div>
      <div><label className={LABEL}>Incluye (una línea por ítem)</label>
        <textarea value={form.includes} onChange={e => setForm(p => ({ ...p, includes: e.target.value }))} rows={4} className={`${INPUT} resize-none`} /></div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div onClick={() => setForm(p => ({ ...p, active: !p.active }))}
          className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-orange-500' : 'bg-slate-200'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
        </div>
        <span className="text-sm text-slate-700 font-medium">Servicio activo</span>
      </label>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className={`flex-1 ${BTN_PRIMARY}`}>
          {saving ? 'Guardando...' : service?.id ? 'Guardar cambios' : 'Crear servicio'}</button>
        <button type="button" onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
      </div>
    </form>
  )
}

function ServicesTab({ init, demoMode }: { init: Service[]; demoMode: boolean }) {
  const [services, setServices] = useState(init)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive(s: Service) {
    if (demoMode) return
    await supabase.from('services').update({ active: !s.active, updated_at: new Date().toISOString() }).eq('id', s.id)
    router.refresh()
  }
  async function handleDelete(id: string) {
    if (demoMode || !confirm('¿Eliminar este servicio?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(s => s.filter(x => x.id !== id))
  }
  function handleSaved() { setEditing(null); setCreating(false); router.refresh() }

  return (
    <div className="space-y-4 max-w-3xl">
      {demoMode && <DemoBanner />}
      {!creating && (
        <button onClick={() => !demoMode && setCreating(true)} disabled={demoMode} className={BTN_PRIMARY}>
          + Crear servicio
        </button>
      )}
      {creating && (
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Nuevo servicio</h3>
          <ServiceForm onSave={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}
      <div className="space-y-3">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            {editing === s.id ? (
              <div className="p-6"><h3 className="font-bold text-slate-900 text-sm mb-4">Editar servicio</h3>
                <ServiceForm service={s} onSave={handleSaved} onCancel={() => setEditing(null)} /></div>
            ) : (
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.active ? 'Activo' : 'Inactivo'}</span>
                    {s.category && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 capitalize">{s.category}</span>}
                  </div>
                  {s.price != null && <p className="text-2xl font-black text-slate-900">{s.price} <span className="text-lg text-slate-400">€</span></p>}
                  {s.short_description && <p className="text-sm text-slate-500 mt-1">{s.short_description}</p>}
                  {s.includes && s.includes.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {s.includes.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5"><span className="text-orange-500">✓</span>{item}</li>
                      ))}
                      {s.includes.length > 3 && <li className="text-xs text-slate-400">+{s.includes.length - 3} más incluido</li>}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(s)} className={BTN_SECONDARY + ' text-xs py-1.5'}>{s.active ? 'Desactivar' : 'Activar'}</button>
                  <button onClick={() => setEditing(s.id)} className={BTN_SECONDARY + ' text-xs py-1.5'}>Editar</button>
                  <button onClick={() => handleDelete(s.id)} className={BTN_DANGER}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && !creating && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-slate-500 font-medium">No hay servicios creados</p>
            <p className="text-xs text-slate-400 mt-1">Crea tu primer servicio para que el bot lo conozca</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Promotions tab ────────────────────────────────────────────────────────────

function PromoForm({ promo, onSave, onCancel }: { promo?: Partial<Promotion>; onSave: () => void; onCancel: () => void }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: promo?.title ?? '', description: promo?.description ?? '',
    bot_text: promo?.bot_text ?? '', active: promo?.active ?? true,
    starts_at: promo?.starts_at ? promo.starts_at.slice(0, 10) : '',
    ends_at: promo?.ends_at ? promo.ends_at.slice(0, 10) : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload = {
      title: form.title, description: form.description || null, bot_text: form.bot_text || null,
      active: form.active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    if (promo?.id) await supabase.from('promotions').update(payload).eq('id', promo.id)
    else await supabase.from('promotions').insert(payload)
    setSaving(false); onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className={LABEL}>Título</label>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className={INPUT} /></div>
      <div><label className={LABEL}>Descripción</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className={`${INPUT} resize-none`} /></div>
      <div><label className={LABEL}>Texto que usará el bot</label>
        <textarea value={form.bot_text} onChange={e => setForm(p => ({ ...p, bot_text: e.target.value }))} rows={3}
          placeholder="Ej: ¡Oferta especial! Por tiempo limitado..." className={`${INPUT} resize-none`} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={LABEL}>Fecha inicio</label>
          <input type="date" value={form.starts_at} onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))} className={INPUT} /></div>
        <div><label className={LABEL}>Fecha fin</label>
          <input type="date" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))} className={INPUT} /></div>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div onClick={() => setForm(p => ({ ...p, active: !p.active }))}
          className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-orange-500' : 'bg-slate-200'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
        </div>
        <span className="text-sm text-slate-700 font-medium">Promoción activa</span>
      </label>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className={`flex-1 ${BTN_PRIMARY}`}>
          {saving ? 'Guardando...' : promo?.id ? 'Guardar cambios' : 'Crear promoción'}</button>
        <button type="button" onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
      </div>
    </form>
  )
}

function PromosTab({ init, demoMode }: { init: Promotion[]; demoMode: boolean }) {
  const [promos, setPromos] = useState(init)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const now = new Date()

  async function toggleActive(p: Promotion) {
    if (demoMode) return
    await supabase.from('promotions').update({ active: !p.active, updated_at: new Date().toISOString() }).eq('id', p.id)
    router.refresh()
  }
  async function handleDelete(id: string) {
    if (demoMode || !confirm('¿Eliminar esta promoción?')) return
    await supabase.from('promotions').delete().eq('id', id)
    setPromos(p => p.filter(x => x.id !== id))
  }
  function handleSaved() { setEditing(null); setCreating(false); router.refresh() }

  return (
    <div className="space-y-4 max-w-3xl">
      {demoMode && <DemoBanner />}
      {!creating && (
        <button onClick={() => !demoMode && setCreating(true)} disabled={demoMode} className={BTN_PRIMARY}>
          + Crear promoción
        </button>
      )}
      {creating && (
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Nueva promoción</h3>
          <PromoForm onSave={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}
      <div className="space-y-3">
        {promos.map(promo => {
          const isExpired = promo.ends_at ? new Date(promo.ends_at) < now : false
          return (
            <div key={promo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              {editing === promo.id ? (
                <div className="p-6"><h3 className="font-bold text-slate-900 text-sm mb-4">Editar promoción</h3>
                  <PromoForm promo={promo} onSave={handleSaved} onCancel={() => setEditing(null)} /></div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-slate-900">{promo.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${promo.active && !isExpired ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isExpired ? 'Expirada' : promo.active ? 'Activa' : 'Inactiva'}</span>
                      </div>
                      {promo.description && <p className="text-sm text-slate-500">{promo.description}</p>}
                      {(promo.starts_at || promo.ends_at) && (
                        <p className="text-xs text-slate-400 mt-1">
                          {promo.starts_at && `Desde ${new Date(promo.starts_at).toLocaleDateString('es-ES')}`}
                          {promo.starts_at && promo.ends_at && ' · '}
                          {promo.ends_at && `Hasta ${new Date(promo.ends_at).toLocaleDateString('es-ES')}`}
                        </p>
                      )}
                      {promo.bot_text && (
                        <p className="text-xs text-orange-600 mt-2 bg-orange-50 px-3 py-2 rounded-lg italic">
                          🤖 {promo.bot_text.slice(0, 80)}{promo.bot_text.length > 80 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(promo)} className={BTN_SECONDARY + ' text-xs py-1.5'}>{promo.active ? 'Desactivar' : 'Activar'}</button>
                      <button onClick={() => setEditing(promo.id)} className={BTN_SECONDARY + ' text-xs py-1.5'}>Editar</button>
                      <button onClick={() => handleDelete(promo.id)} className={BTN_DANGER}>Eliminar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {promos.length === 0 && !creating && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="text-slate-500 font-medium">No hay promociones creadas</p>
            <p className="text-xs text-slate-400 mt-1">Las promociones activas las menciona el bot automáticamente</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function DemoBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
      Modo demo — conecta Supabase para guardar cambios reales
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function SettingsClient({
  initialSettings,
  initialServices,
  initialPromos,
  demoMode = false,
}: {
  initialSettings: Record<string, string>
  initialServices: Service[]
  initialPromos: Promotion[]
  demoMode?: boolean
}) {
  const [tab, setTab] = useState('general')

  return (
    <div>
      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && <GeneralTab init={initialSettings} demoMode={demoMode} />}
      {tab === 'servicios' && <ServicesTab init={initialServices} demoMode={demoMode} />}
      {tab === 'promociones' && <PromosTab init={initialPromos} demoMode={demoMode} />}
      {tab === 'bot' && <BotTab init={initialSettings} demoMode={demoMode} />}
    </div>
  )
}
