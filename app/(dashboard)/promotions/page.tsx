import { getPromotions } from '@/lib/db'
import { isDemoMode } from '@/lib/db'
import PromotionsClient from './PromotionsClient'
import type { Promotion } from '@/types'

export default async function PromotionsPage() {
  const promotions = await getPromotions()
  const demo = isDemoMode()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Promociones</h1>
        <p className="text-slate-500 mt-1 text-sm">Gestiona las promociones que el bot menciona en las conversaciones</p>
      </div>
      <PromotionsClient initialPromos={promotions as Promotion[]} demoMode={demo} />
    </div>
  )
}
