'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Promotion } from '@/types'

function PromotionForm({
  promo,
  onSave,
  onCancel,
}: {
  promo?: Partial<Promotion>
  onSave: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: promo?.title ?? '',
    description: promo?.description ?? '',
    bot_text: promo?.bot_text ?? '',
    active: promo?.active ?? true,
    starts_at: promo?.starts_at ? promo.starts_at.slice(0, 10) : '',
    ends_at: promo?.ends_at ? promo.ends_at.slice(0, 10) : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      description: form.description || null,
      bot_text: form.bot_text || null,
      active: form.active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (promo?.id) {
      await supabase.from('promotions').update(payload).eq('id', promo.id)
    } else {
      await supabase.from('promotions').insert(payload)
    }

    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Texto que usará el bot</label>
        <textarea value={form.bot_text} onChange={e => setForm(p => ({ ...p, bot_text: e.target.value }))} rows={3}
          placeholder="Ej: ¡Tenemos una oferta especial! Por tiempo limitado..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha inicio</label>
          <input type="date" value={form.starts_at} onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha fin</label>
          <input type="date" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
        Promoción activa
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {saving ? 'Guardando...' : promo?.id ? 'Guardar cambios' : 'Crear promoción'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function PromotionsClient({ initialPromos, demoMode = false }: { initialPromos: Promotion[]; demoMode?: boolean }) {
  const [promos, setPromos] = useState(initialPromos)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive(promo: Promotion) {
    if (demoMode) return
    await supabase.from('promotions').update({ active: !promo.active, updated_at: new Date().toISOString() }).eq('id', promo.id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (demoMode || !confirm('¿Eliminar esta promoción?')) return
    await supabase.from('promotions').delete().eq('id', id)
    setPromos(p => p.filter(x => x.id !== id))
  }

  function handleSaved() {
    setEditing(null)
    setCreating(false)
    router.refresh()
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      {demoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
          Modo demo — los cambios se activarán al conectar la base de datos
        </div>
      )}

      {!creating && (
        <button onClick={() => !demoMode && setCreating(true)} disabled={demoMode}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          + Crear promoción
        </button>
      )}

      {creating && (
        <div className="bg-white rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Nueva promoción</h3>
          <PromotionForm onSave={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div className="space-y-3">
        {promos.map(promo => {
          const isExpired = promo.ends_at ? new Date(promo.ends_at) < now : false
          return (
            <div key={promo.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {editing === promo.id ? (
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 text-sm mb-4">Editar promoción</h3>
                  <PromotionForm promo={promo} onSave={handleSaved} onCancel={() => setEditing(null)} />
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{promo.title}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          promo.active && !isExpired ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isExpired ? 'Expirada' : promo.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      {promo.description && <p className="text-sm text-slate-500">{promo.description}</p>}
                      {(promo.starts_at || promo.ends_at) && (
                        <p className="text-xs text-slate-400 mt-1">
                          {promo.starts_at && `Desde: ${new Date(promo.starts_at).toLocaleDateString('es-ES')}`}
                          {promo.starts_at && promo.ends_at && ' · '}
                          {promo.ends_at && `Hasta: ${new Date(promo.ends_at).toLocaleDateString('es-ES')}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(promo)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg transition-colors">
                        {promo.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => setEditing(promo.id)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg transition-colors">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(promo.id)}
                        className="px-3 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 text-xs rounded-lg transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {promos.length === 0 && !creating && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            No hay promociones creadas
          </div>
        )}
      </div>
    </div>
  )
}
