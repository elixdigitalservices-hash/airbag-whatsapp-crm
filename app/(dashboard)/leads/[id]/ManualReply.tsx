'use client'

import { useState, useRef } from 'react'

interface Props {
  leadId: string
  phone: string
  demoMode: boolean
}

export default function ManualReply({ leadId, phone, demoMode }: Props) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const trimmed = message.trim()
    if (!trimmed || sending) return

    setSending(true)
    setStatus(null)

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message: trimmed, leadId }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus({ ok: true, text: 'Mensaje enviado' })
        setMessage('')
        setTimeout(() => setStatus(null), 3000)
      } else if (data.error === 'demo_mode') {
        setStatus({ ok: false, text: 'Conecta WhatsApp para enviar mensajes reales' })
      } else {
        setStatus({ ok: false, text: data.error ?? 'Error al enviar' })
      }
    } catch {
      setStatus({ ok: false, text: 'Error de red' })
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-slate-100 px-5 py-4">
      {demoMode && (
        <div className="mb-3 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
          Modo demo — conecta WhatsApp para enviar mensajes reales
        </div>
      )}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje... (Cmd+Enter para enviar)"
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          {status && (
            <p className={`text-xs mt-1.5 ${status.ok ? 'text-emerald-600' : 'text-red-500'}`}>
              {status.ok ? '✓ ' : '✕ '}{status.text}
            </p>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2 flex-shrink-0 h-[42px]"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Enviar <span className="text-orange-200">↑</span></>
          )}
        </button>
      </div>
    </div>
  )
}
