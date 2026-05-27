import { getServices } from '@/lib/db'
import { isDemoMode } from '@/lib/db'
import ServicesClient from './ServicesClient'
import type { Service } from '@/types'

export default async function ServicesPage() {
  const services = await getServices()
  const demo = isDemoMode()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
        <p className="text-slate-500 mt-1 text-sm">Gestiona los servicios que ofrece la autoescuela</p>
      </div>
      <ServicesClient initialServices={services as Service[]} demoMode={demo} />
    </div>
  )
}
