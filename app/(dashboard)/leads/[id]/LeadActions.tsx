'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadStatus } from '@/types'

function DemoBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
      Modo demo — las acciones se activarán al conectar la base de datos
    </div>
  )
}

export default function LeadActions({ lead, demoMode }: { lead: Lead; demoMode: boolean }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function updateStatus(status: LeadStatus) {
    if (demoMode) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', lead.id)
    router.refresh()
    setSaving(false)
  }

  async function toggleHuman() {
    if (demoMode) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('leads').update({ requires_human: !lead.requires_human, updated_at: new Date().toISOString() }).eq('id', lead.id)
    router.refresh()
    setSaving(false)
  }

  async function markPaid() {
    if (demoMode) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('leads').update({ payment_status: 'paid', status: 'paid', updated_at: new Date().toISOString() }).eq('id', lead.id)
    router.refresh()
    setSaving(false)
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() || demoMode) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('internal_notes').insert({ lead_id: lead.id, note: note.trim() })
    setNote('')
    router.refresh()
    setSaving(false)
  }

  function copyPhone() {
    navigator.clipboard.writeText(lead.phone)
  }

  const whatsappUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}`

  return (
    <div className="space-y-4">
      {demoMode && <DemoBanner />}

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Acciones</h3>
        <div className="space-y-2">
          <button onClick={() => updateStatus('interested')} disabled={saving || demoMode}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50">
            ✅ Marcar como contactado
          </button>
          <button onClick={toggleHuman} disabled={saving || demoMode}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors disabled:opacity-50 ${
              lead.requires_human
                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                : 'text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}>
            🙋 {lead.requires_human ? 'Quitar pendiente humano' : 'Marcar pendiente humano'}
          </button>
          <button onClick={() => updateStatus('closed')} disabled={saving || demoMode}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50">
            🔒 Marcar como cerrado
          </button>
          <button onClick={markPaid} disabled={saving || demoMode}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-green-700 hover:bg-green-50 border border-green-200 transition-colors disabled:opacity-50">
            💰 Marcar como pagado manualmente
          </button>
          <button onClick={copyPhone}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors">
            📋 Copiar teléfono
          </button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-green-700 hover:bg-green-50 border border-green-200 transition-colors">
            💬 Abrir WhatsApp
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Añadir nota interna</h3>
        <form onSubmit={addNote} className="space-y-2">
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Escribe una nota..." rows={3}
            disabled={demoMode}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:bg-slate-50" />
          <button type="submit" disabled={saving || !note.trim() || demoMode}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            Guardar nota
          </button>
        </form>
      </div>
    </div>
  )
}
