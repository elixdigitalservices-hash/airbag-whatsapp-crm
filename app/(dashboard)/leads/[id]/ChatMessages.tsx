'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/types'

function dateSeparator(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ChatMessages({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  const groups: { date: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const date = dateSeparator(msg.created_at)
    const last = groups[groups.length - 1]
    if (last && last.date === date) last.msgs.push(msg)
    else groups.push({ date, msgs: [msg] })
  }

  return (
    <div className="bg-[#f0f2f5] px-5 py-4 space-y-3 max-h-[520px] overflow-y-auto scroll-smooth">
      {messages.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-slate-400 text-sm">Sin mensajes aún</p>
        </div>
      )}

      {groups.map(group => (
        <div key={group.date}>
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-slate-200/80" />
            <span className="text-[11px] text-slate-400 font-semibold px-3 py-1 bg-white rounded-full shadow-sm capitalize">
              {group.date}
            </span>
            <div className="flex-1 h-px bg-slate-200/80" />
          </div>

          <div className="space-y-1.5">
            {group.msgs.map(msg => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.direction === 'outbound'
                    ? msg.sender_type === 'human'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-slate-900 rounded-bl-sm border border-slate-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1.5 mt-1.5 ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-[11px] ${
                      msg.direction === 'outbound' ? 'text-white/60' : 'text-slate-400'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      msg.direction === 'outbound'
                        ? msg.sender_type === 'human'
                          ? 'bg-blue-400/30 text-blue-100'
                          : 'bg-orange-400/30 text-orange-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {msg.sender_type === 'bot' ? '🤖 Bot' : msg.sender_type === 'human' ? '👤 Tú' : '💬 Cliente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
