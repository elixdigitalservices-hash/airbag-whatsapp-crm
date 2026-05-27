import { getLeads, getLeadsPaginated } from '@/lib/db'
import LeadsPageClient from './LeadsPageClient'

const LIMIT = 25

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const activeStatus = params.status ?? 'all'

  const [{ leads, total }, allLeads] = await Promise.all([
    getLeadsPaginated({ status: activeStatus, q: params.q, page, limit: LIMIT }),
    getLeads(),
  ])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <LeadsPageClient
      leads={leads}
      total={total}
      page={page}
      totalPages={totalPages}
      allLeads={allLeads}
      activeStatus={activeStatus}
      q={params.q}
    />
  )
}
