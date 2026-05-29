'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/conversations', label: 'Conversaciones', icon: '💬' },
  { href: '/payments', label: 'Pagos', icon: '💳' },
  { href: '/settings', label: 'Ajustes', icon: '⚙️' },
]

const COMING_SOON = [
  { href: '/clases', label: 'Clases Prácticas', icon: '🚗' },
  { href: '/expedientes', label: 'Expedientes', icon: '🗂️' },
  { href: '/portal', label: 'Portal Alumno', icon: '📱' },
  { href: '/facturacion', label: 'Facturación', icon: '🧾' },
  { href: '/videos', label: 'Plataforma Vídeos', icon: '🎬' },
  { href: '/ads', label: 'Campañas de Ads', icon: '📣' },
]

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Sidebar({ urgentCount = 0 }: { urgentCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

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
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen bg-slate-900 hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className={`border-b border-slate-700/50 ${collapsed ? 'px-3 py-4 flex flex-col items-center gap-3' : 'px-5 py-5'}`}>
        {collapsed ? (
          <>
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-500/30">
              A
            </div>
            <button
              onClick={() => setCollapsed(false)}
              title="Expandir menú"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-orange-500 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-500/30 flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
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
            <button
              onClick={() => setCollapsed(true)}
              title="Colapsar menú"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-white transition-all flex-shrink-0"
            >
              <ChevronLeft />
            </button>
          </div>
        )}
      </div>

      {/* Demo banner — solo expandido */}
      {IS_DEMO && !collapsed && (
        <div className="mx-3 mt-3 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-400 font-medium">Modo demo activo</p>
          <p className="text-xs text-slate-500 mt-0.5">Conecta Supabase para activar todo</p>
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          const showBadge = item.href === '/leads' && urgentCount > 0

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all duration-150 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {urgentCount > 9 ? '9+' : urgentCount}
                  </span>
                )}
              </Link>
            )
          }

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
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex items-center justify-center min-w-[20px] h-5 bg-red-500 rounded-full text-[10px] font-bold text-white px-1.5 shadow-sm animate-pulse">
                  {urgentCount > 9 ? '9+' : urgentCount}
                </span>
              )}
            </Link>
          )
        })}

        {/* Separador Próximamente */}
        {collapsed ? (
          <div className="pt-3 pb-1 mx-2 border-t border-slate-800" />
        ) : (
          <div className="pt-4 pb-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Próximamente</p>
          </div>
        )}

        {COMING_SOON.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-600 hover:bg-slate-800 hover:text-slate-400'
                }`}
              >
                <span className="text-base opacity-70">{item.icon}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] font-bold bg-slate-700 group-hover:bg-slate-600 text-slate-400 px-1.5 py-0.5 rounded-md tracking-wide">
                BETA
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`pb-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        <div className="border-t border-slate-700/50 pt-4">
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              <span className="text-lg">🚪</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              <span className="text-base">🚪</span>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
