import Link from 'next/link'
import { getLeadsWithMessages } from '@/lib/db'
import { LeadStatusBadge } from '@/components/StatusBadge'
import type { Lead, Message, LeadStatus } from '@/types'

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ only_human?: string }>
}) {
  const params = await searchParams
  const onlyHuman = params.only_human === '1'

  let leads = await getLeadsWithMessages() as (Lead & { messages: Message[] })[]
  if (onlyHuman) leads = leads.filter(l => l.requires_human)

  const humanCount = (await getLeadsWithMessages() as Lead[]).filter(l => l.requires_human).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conversaciones</h1>
          <p className="text-slate-500 mt-1 text-sm">{leads.length} conversaciones</p>
        </div>
        <div className="flex gap-2">
          <Link href="/conversations"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              !onlyHuman
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600'
            }`}>
            Todas
          </Link>
          <Link href="/conversations?only_human=1"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              onlyHuman
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600'
            }`}>
            🙋 Pendientes
            {humanCount > 0 && (
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                onlyHuman ? 'bg-white/20' : 'bg-orange-500 text-white'
              }`}>
                {humanCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {leads.length === 0 && (
          <div className="px-6 py-16 text-center text-slate-400">Sin conversaciones</div>
        )}
        {leads.map(lead => {
          const msgs = lead.messages ?? []
          const lastMsg = [...msgs].sort((a: Message, b: Message) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
          const initial = (lead.name ?? lead.phone).charAt(0).toUpperCase()

          return (
            <Link key={lead.id} href={`/leads/${lead.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/40 transition-colors group">
              <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                    {lead.name ?? lead.phone}
                  </p>
                  {lead.requires_human && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white">
                      🙋 Humano
                    </span>
                  )}
                  <LeadStatusBadge status={lead.status as LeadStatus} />
                </div>
                <p className="text-sm text-slate-400 truncate">{lastMsg?.content ?? 'Sin mensajes'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">
                  {lastMsg
                    ? new Date(lastMsg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
                    : '—'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">{msgs.length} msgs</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
