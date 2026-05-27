'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const FIELDS = [
  { key: 'school_name', label: 'Nombre de la autoescuela', type: 'text' },
  { key: 'school_phone', label: 'Teléfono', type: 'text' },
  { key: 'school_email', label: 'Email', type: 'email' },
  { key: 'school_address', label: 'Dirección', type: 'text' },
  { key: 'school_hours', label: 'Horario', type: 'text' },
  { key: 'school_web', label: 'Web', type: 'url' },
  { key: 'welcome_message', label: 'Mensaje de bienvenida', type: 'textarea' },
  { key: 'handoff_message', label: 'Mensaje de derivación humana', type: 'textarea' },
]

export default function SettingsClient({
  initialSettings,
  demoMode = false,
}: {
  initialSettings: Record<string, string>
  demoMode?: boolean
}) {
  const [values, setValues] = useState(initialSettings)
  const [chatbotActive, setChatbotActive] = useState(initialSettings.chatbot_active === 'true')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (demoMode) { setSaved(true); setTimeout(() => setSaved(false), 2000); return }
    setSaving(true)

    const upserts = FIELDS.map(f => ({
      key: f.key,
      value: JSON.stringify(values[f.key] ?? ''),
      updated_at: new Date().toISOString(),
    }))

    upserts.push({
      key: 'chatbot_active',
      value: JSON.stringify(chatbotActive),
      updated_at: new Date().toISOString(),
    })

    await supabase.from('settings').upsert(upserts, { onConflict: 'key' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 text-sm">Datos de la autoescuela</h2>
        {FIELDS.slice(0, 6).map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
            <input
              type={field.type}
              value={values[field.key] ?? ''}
              onChange={e => setValues(p => ({ ...p, [field.key]: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 text-sm">Mensajes del bot</h2>
        {FIELDS.slice(6).map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
            <textarea
              value={values[field.key] ?? ''}
              onChange={e => setValues(p => ({ ...p, [field.key]: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 text-sm mb-4">Control del chatbot</h2>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-slate-900">Chatbot activo</p>
            <p className="text-xs text-slate-500 mt-0.5">Si está inactivo, el bot no responde a nuevos mensajes</p>
          </div>
          <button
            type="button"
            onClick={() => setChatbotActive(v => !v)}
            className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${
              chatbotActive ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              chatbotActive ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar ajustes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Guardado correctamente</span>
        )}
      </div>
    </form>
  )
}
