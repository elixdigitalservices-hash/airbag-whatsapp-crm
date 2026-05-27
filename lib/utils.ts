export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'ahora mismo'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return `hace ${m} min`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `hace ${h}h`
  }
  if (diff < 172800) return 'ayer'
  if (diff < 604800) {
    const d = Math.floor(diff / 86400)
    return `hace ${d} días`
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function groupMessagesByDate(messages: { created_at: string }[]): Map<string, typeof messages> {
  const groups = new Map<string, typeof messages>()
  for (const msg of messages) {
    const key = new Date(msg.created_at).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(msg)
  }
  return groups
}
