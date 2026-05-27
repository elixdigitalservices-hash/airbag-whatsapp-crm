'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { LeadStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge'
import { timeAgo } from '@/lib/utils'
import type { Lead, Message, LeadStatus } from '@/types'

interface DrawerData {
  lead: Lead
  messages: Message[]
}

export default function LeadsDrawer({
  leadId,
  onClose,
}: {
  leadId: string | null
  onClose: () => void
}) {
  const [data, setData] = useState<DrawerData | null>(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!leadId) { setData(null); return }
    setLoading(true)
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [leadId])

  useEffect(() => {
    if (data?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [data?.messages])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isOpen = !!leadId

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {data?.lead && (
              <>
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                  {(data.lead.name ?? data.lead.phone).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{data.lead.name ?? <span className="italic text-slate-400">Sin nombre</span>}</p>
                  <p className="text-xs text-slate-400">{data.lead.phone}</p>
                </div>
              </>
            )}
            {loading && <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />}
          </div>
          <div className="flex items-center gap-2">
            {data?.lead && (
              <Link
                href={`/leads/${data.lead.id}`}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Ver completo →
              </Link>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
              ✕
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {data && !loading && (
          <>
            {/* Info rápida */}
            <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap gap-2">
              <LeadStatusBadge status={data.lead.status as LeadStatus} />
              <PaymentStatusBadge status={data.lead.payment_status} />
              {data.lead.requires_human && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white">
                  🙋 Pendiente humano
                </span>
              )}
              <span className="text-xs text-slate-400 self-center ml-auto">
                Activo {timeAgo(data.lead.updated_at)}
              </span>
            </div>

            {/* Resumen */}
            {data.lead.summary && (
              <div className="mx-4 mt-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-orange-700 mb-1">Resumen IA</p>
                <p className="text-sm text-slate-700">{data.lead.summary}</p>
              </div>
            )}

            {/* Interés */}
            {(data.lead.interest || data.lead.selected_pack) && (
              <div className="mx-4 mt-2 flex gap-2">
                {data.lead.interest && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{data.lead.interest}</span>
                )}
                {data.lead.selected_pack && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">{data.lead.selected_pack}</span>
                )}
              </div>
            )}

            {/* Chat mini */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 mt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Conversación ({data.messages.length} mensajes)
              </p>
              {data.messages.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">Sin mensajes</p>
              )}
              {data.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.direction === 'outbound'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    <p className="whitespace-pre-wrap leading-snug">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.direction === 'outbound' ? 'text-orange-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{msg.sender_type === 'bot' ? 'Bot' : msg.sender_type === 'human' ? 'Humano' : 'Cliente'}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${data.lead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  💬 Abrir WhatsApp
                </a>
                <Link
                  href={`/leads/${data.lead.id}`}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  Ver detalle completo
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
