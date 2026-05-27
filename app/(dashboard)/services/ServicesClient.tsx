'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types'

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service?: Partial<Service>
  onSave: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: service?.name ?? '',
    category: service?.category ?? '',
    price: service?.price?.toString() ?? '',
    short_description: service?.short_description ?? '',
    includes: (service?.includes ?? []).join('\n'),
    payment_link: service?.payment_link ?? '',
    active: service?.active ?? true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      category: form.category || null,
      price: form.price ? parseFloat(form.price) : null,
      short_description: form.short_description || null,
      includes: form.includes ? form.includes.split('\n').map(s => s.trim()).filter(Boolean) : null,
      payment_link: form.payment_link || null,
      active: form.active,
      updated_at: new Date().toISOString(),
    }

    if (service?.id) {
      await supabase.from('services').update(payload).eq('id', service.id)
    } else {
      await supabase.from('services').insert(payload)
    }

    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sin categoría</option>
            <option value="coche">Coche</option>
            <option value="moto">Moto</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Precio (€)</label>
          <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Link de pago</label>
          <input value={form.payment_link} onChange={e => setForm(p => ({ ...p, payment_link: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Descripción corta</label>
        <input value={form.short_description} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Incluye (una línea por ítem)</label>
        <textarea value={form.includes} onChange={e => setForm(p => ({ ...p, includes: e.target.value }))} rows={4}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
          className="rounded" />
        Servicio activo
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {saving ? 'Guardando...' : service?.id ? 'Guardar cambios' : 'Crear servicio'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function ServicesClient({ initialServices, demoMode = false }: { initialServices: Service[]; demoMode?: boolean }) {
  const [services, setServices] = useState(initialServices)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive(service: Service) {
    if (demoMode) return
    await supabase.from('services').update({ active: !service.active, updated_at: new Date().toISOString() }).eq('id', service.id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (demoMode || !confirm('¿Eliminar este servicio?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(s => s.filter(x => x.id !== id))
  }

  function handleSaved() {
    setEditing(null)
    setCreating(false)
    router.refresh()
  }

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
          + Crear servicio
        </button>
      )}

      {creating && (
        <div className="bg-white rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Nuevo servicio</h3>
          <ServiceForm onSave={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {editing === service.id ? (
              <div className="p-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-4">Editar servicio</h3>
                <ServiceForm service={service} onSave={handleSaved} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      service.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {service.active ? 'Activo' : 'Inactivo'}
                    </span>
                    {service.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {service.category}
                      </span>
                    )}
                  </div>
                  {service.price != null && (
                    <p className="text-2xl font-bold text-slate-900">{service.price} €</p>
                  )}
                  {service.short_description && (
                    <p className="text-sm text-slate-500 mt-1">{service.short_description}</p>
                  )}
                  {service.includes && service.includes.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {service.includes.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                          <span className="text-green-500">✓</span> {item}
                        </li>
                      ))}
                      {service.includes.length > 3 && (
                        <li className="text-xs text-slate-400">+{service.includes.length - 3} más</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(service)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg transition-colors">
                    {service.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => setEditing(service.id)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(service.id)}
                    className="px-3 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 text-xs rounded-lg transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
