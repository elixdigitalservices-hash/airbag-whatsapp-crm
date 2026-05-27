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

  // Agrupar por fecha
  const groups: { date: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const date = dateSeparator(msg.created_at)
    const last = groups[groups.length - 1]
    if (last && last.date === date) {
      last.msgs.push(msg)
    } else {
      groups.push({ date, msgs: [msg] })
    }
  }

  return (
    <div className="p-5 space-y-4 max-h-[540px] overflow-y-auto scroll-smooth">
      {messages.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-12">Sin mensajes aún</p>
      )}

      {groups.map(group => (
        <div key={group.date}>
          {/* Separador de fecha */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium px-2 capitalize">{group.date}</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="space-y-2">
            {group.msgs.map(msg => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.direction === 'outbound'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1.5 ${msg.direction === 'outbound' ? 'text-orange-200' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {msg.sender_type === 'bot' ? '🤖 Bot' : msg.sender_type === 'human' ? '👤 Humano' : '💬 Cliente'}
                  </p>
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
