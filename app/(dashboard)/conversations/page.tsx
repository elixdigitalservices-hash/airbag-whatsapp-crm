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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conversaciones</h1>
          <p className="text-slate-500 mt-1 text-sm">{leads.length} conversaciones</p>
        </div>
        <div className="flex gap-2">
          <Link href="/conversations"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!onlyHuman ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Todas
          </Link>
          <Link href="/conversations?only_human=1"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${onlyHuman ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            🙋 Pendientes humano
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {leads.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-400">Sin conversaciones</div>
        )}
        {leads.map(lead => {
          const msgs = lead.messages ?? []
          const lastMsg = msgs.sort((a: Message, b: Message) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          return (
            <Link key={lead.id} href={`/leads/${lead.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                {(lead.name ?? lead.phone).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-slate-900 text-sm">{lead.name ?? lead.phone}</p>
                  {lead.requires_human && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                      Pendiente humano
                    </span>
                  )}
                  <LeadStatusBadge status={lead.status as LeadStatus} />
                </div>
                <p className="text-sm text-slate-500 truncate">{lastMsg?.content ?? 'Sin mensajes'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">
                  {lastMsg ? new Date(lastMsg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '—'}
                </p>
                <p className="text-xs text-slate-400 mt-1">{msgs.length} msgs</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
