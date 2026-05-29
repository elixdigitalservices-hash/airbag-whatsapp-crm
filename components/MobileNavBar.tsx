'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/leads', icon: '👥', label: 'Leads' },
  { href: '/conversations', icon: '💬', label: 'Chats' },
  { href: '/payments', icon: '💳', label: 'Pagos' },
  { href: '/settings', icon: '⚙️', label: 'Ajustes' },
]

export default function MobileNavBar({ urgentCount = 0 }: { urgentCount?: number }) {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900 border-t border-slate-700/60 flex safe-pb">
      {NAV.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const showBadge = item.href === '/leads' && urgentCount > 0
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold transition-colors relative ${
              isActive ? 'text-orange-400' : 'text-slate-400'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="truncate">{item.label}</span>
            {showBadge && (
              <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {urgentCount > 9 ? '9+' : urgentCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
