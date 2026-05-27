import { getSettings, isDemoMode } from '@/lib/db'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const settings = await getSettings()
  const demo = isDemoMode()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
        <p className="text-slate-500 mt-1 text-sm">Configura los datos y mensajes de la autoescuela</p>
      </div>
      <SettingsClient initialSettings={settings} demoMode={demo} />
    </div>
  )
}
