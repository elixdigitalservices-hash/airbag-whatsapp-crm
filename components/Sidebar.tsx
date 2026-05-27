'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/conversations', label: 'Conversaciones', icon: '💬' },
  { href: '/payments', label: 'Pagos', icon: '💳' },
  { href: '/services', label: 'Servicios', icon: '🎓' },
  { href: '/promotions', label: 'Promociones', icon: '🏷️' },
  { href: '/settings', label: 'Ajustes', icon: '⚙️' },
]

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    if (IS_DEMO) {
      await fetch('/api/auth/demo-login', { method: 'DELETE' })
      router.push('/login')
      router.refresh()
      return
    }
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm">Airbag CRM</p>
              {IS_DEMO && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                  Demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Autoescuela Airbag</p>
          </div>
        </div>
      </div>

      {IS_DEMO && (
        <div className="mx-3 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-700 font-medium">Modo demo activo</p>
          <p className="text-xs text-amber-600 mt-0.5">Conecta Supabase para activar todas las funciones</p>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <span className="text-base">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
