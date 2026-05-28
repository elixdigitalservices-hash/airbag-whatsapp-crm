import { getSettings, getServices, getPromotions, isDemoMode } from '@/lib/db'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const [settings, services, promos] = await Promise.all([
    getSettings(),
    getServices(),
    getPromotions(),
  ])

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
        <p className="text-slate-500 mt-1 text-sm">Datos del centro, servicios, promociones y configuración del bot</p>
      </div>
      <SettingsClient
        initialSettings={settings}
        initialServices={services}
        initialPromos={promos}
        demoMode={isDemoMode()}
      />
    </div>
  )
}
