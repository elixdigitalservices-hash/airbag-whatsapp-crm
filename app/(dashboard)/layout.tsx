import Sidebar from '@/components/Sidebar'
import MobileNavBar from '@/components/MobileNavBar'
import { isDemoMode } from '@/lib/db'
import { createServiceClient } from '@/lib/supabase/service'

async function getUrgentCount(): Promise<number> {
  if (isDemoMode()) return 0
  try {
    const supabase = createServiceClient()
    const { count } = await supabase.from('leads').select('id', { count: 'exact' }).eq('requires_human', true)
    return count ?? 0
  } catch { return 0 }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const urgentCount = await getUrgentCount()
  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <Sidebar urgentCount={urgentCount} />
      <main className="flex-1 overflow-auto min-h-screen pb-16 md:pb-0">
        {children}
      </main>
      <MobileNavBar urgentCount={urgentCount} />
    </div>
  )
}
