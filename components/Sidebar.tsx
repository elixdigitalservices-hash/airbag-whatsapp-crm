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
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-500/30">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-sm tracking-tight">Airbag CRM</p>
              {IS_DEMO && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Autoescuela Airbag</p>
          </div>
        </div>
      </div>

      {IS_DEMO && (
        <div className="mx-3 mt-3 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-400 font-medium">Modo demo activo</p>
          <p className="text-xs text-slate-500 mt-0.5">Conecta Supabase para activar todo</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="border-t border-slate-700/50 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
          >
            <span className="text-base">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
