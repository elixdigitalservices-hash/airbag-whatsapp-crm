'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Lead, LeadStatus } from '@/types'

export default function LeadActions({ lead, demoMode }: { lead: Lead; demoMode: boolean }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function patchLead(body: Record<string, unknown>) {
    if (demoMode) return
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.refresh()
  }

  async function updateStatus(status: LeadStatus) {
    setSaving(true)
    await patchLead({ status })
    setSaving(false)
  }

  async function toggleHuman() {
    setSaving(true)
    await patchLead({ requires_human: !lead.requires_human })
    setSaving(false)
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() || demoMode) return
    setSaving(true)
    await fetch(`/api/leads/${lead.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note.trim() }),
    })
    setNote('')
    router.refresh()
    setSaving(false)
  }

  const whatsappUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}`

  return (
    <div className="space-y-4">
      {/* Human takeover card */}
      <div className={`rounded-2xl border-2 p-5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] ${
        lead.requires_human
          ? 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50'
          : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            lead.requires_human ? 'bg-red-100' : 'bg-slate-100'
          }`}>
            <span className="text-lg">{lead.requires_human ? '🚨' : '🤖'}</span>
          </div>
          <div>
            <p className={`font-bold text-sm ${lead.requires_human ? 'text-red-800' : 'text-slate-900'}`}>
              {lead.requires_human ? 'Atención humana activa' : 'Bot activo'}
            </p>
            <p className={`text-xs mt-0.5 ${lead.requires_human ? 'text-red-600' : 'text-slate-400'}`}>
              {lead.requires_human
                ? 'El bot está pausado para este lead'
                : 'Respondiendo automáticamente'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleHuman}
          disabled={saving || demoMode}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm ${
            lead.requires_human
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
          }`}
        >
          {saving ? '...' : lead.requires_human ? '✓ Reactivar bot' : '🙋 Tomar conversación'}
        </button>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="font-bold text-slate-900 text-sm">Acciones</h3>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => updateStatus('interested')}
            disabled={saving || demoMode || lead.status === 'interested'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all disabled:opacity-40 font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-sm transition-colors">✅</span>
            Marcar como contactado
          </button>
          <button
            onClick={() => updateStatus('lost')}
            disabled={saving || demoMode || lead.status === 'lost'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all disabled:opacity-40 font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-sm transition-colors">📤</span>
            Marcar como perdido
          </button>
          <button
            onClick={() => updateStatus('closed')}
            disabled={saving || demoMode || lead.status === 'closed'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all disabled:opacity-40 font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center text-sm transition-colors">🔒</span>
            Cerrar lead
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-emerald-700 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 transition-all font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-sm transition-colors">💬</span>
            Abrir en WhatsApp
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(lead.phone)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-orange-700 hover:bg-orange-50 border border-orange-100 hover:border-orange-200 transition-all font-medium group"
          >
            <span className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-sm transition-colors">📋</span>
            Copiar teléfono
          </button>
        </div>
      </div>

      {/* Internal note */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="font-bold text-slate-900 text-sm">Nota interna</h3>
        </div>
        <form onSubmit={addNote} className="p-4 space-y-3">
          {demoMode && (
            <div className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
              Modo demo — conecta Supabase para guardar notas
            </div>
          )}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Escribe una nota privada sobre este lead..."
            rows={3}
            disabled={demoMode}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none disabled:opacity-50 bg-slate-50 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={saving || !note.trim() || demoMode}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-orange-500/20 active:scale-[0.98]"
          >
            {saving ? 'Guardando...' : 'Guardar nota'}
          </button>
        </form>
      </div>
    </div>
  )
}
