import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeResponse, Service, Promotion } from '@/types'

const FALLBACK: ClaudeResponse = {
  reply:
    'Ahora mismo no puedo confirmar esa información con seguridad. Para evitar darte un dato incorrecto, contacta directamente con Autoescuela Airbag: 955 542 232 o info@aeairbag.com.',
  lead_updates: {
    name: null,
    interest: null,
    selected_service_id: null,
    status: 'asked_info',
    payment_status: 'unpaid',
    requires_human: false,
    summary: '',
  },
  actions: {
    send_payment_link: false,
    payment_link: null,
    handoff_to_human: false,
  },
}

export async function getChatbotReply({
  userMessage,
  conversationHistory,
  services,
  promotions,
  settings,
  leadSummary,
}: {
  userMessage: string
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
  services: Service[]
  promotions: Promotion[]
  settings: Record<string, string>
  leadSummary?: string | null
}): Promise<ClaudeResponse> {
  const activeServices = services.filter(s => s.active)
  const activePromotions = promotions.filter(p => {
    if (!p.active) return false
    const now = new Date()
    if (p.starts_at && new Date(p.starts_at) > now) return false
    if (p.ends_at && new Date(p.ends_at) < now) return false
    return true
  })

  const systemPrompt = `Eres el asistente virtual de ${settings.school_name ?? 'Autoescuela Airbag'}, una autoescuela en Sevilla.

Datos de contacto:
- Teléfono: ${settings.school_phone ?? '955 542 232'}
- Email: ${settings.school_email ?? 'info@aeairbag.com'}
- Dirección: ${settings.school_address ?? 'C. Navarro Caro, Tomares, Sevilla'}
- Horario: ${settings.school_hours ?? '10:00 a 13:00 y 17:00 a 20:00'}

SERVICIOS DISPONIBLES:
${activeServices.map(s => `
- ${s.name} (${s.price != null ? s.price + ' €' : 'Precio no disponible'})
  ${s.short_description ?? ''}
  Incluye: ${(s.includes ?? []).join(', ')}
  ${s.payment_link ? `Link de pago: ${s.payment_link}` : ''}
`).join('\n')}

PROMOCIONES ACTIVAS:
${activePromotions.length > 0 ? activePromotions.map(p => `- ${p.title}: ${p.bot_text ?? p.description ?? ''}`).join('\n') : 'Sin promociones activas'}

${leadSummary ? `HISTORIAL DEL LEAD: ${leadSummary}` : ''}

REGLAS:
- Responde SIEMPRE en español.
- Responde SOLO sobre los servicios y datos de la autoescuela.
- NO inventes precios, fechas exactas, ni promociones.
- NO prometas aprobados ni resultados.
- Si no tienes información suficiente, deriva al equipo humano.
- Deriva a humano si: hay problemas de pago, el usuario ya pagó pero no aparece, preguntan fechas exactas de examen, disponibilidad concreta, casos especiales, recuperación de puntos, o el usuario quiere hablar con una persona.
- Mensaje de derivación: "${settings.handoff_message ?? 'Para esto es mejor que te atienda directamente el equipo de Autoescuela Airbag.\n📞 Teléfono: 955 542 232\n✉️ Email: info@aeairbag.com'}"

RESPONDE ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto fuera del JSON:
{
  "reply": "mensaje para WhatsApp (texto plano, puede incluir emojis y saltos de línea)",
  "lead_updates": {
    "name": null,
    "interest": null,
    "selected_service_id": null,
    "status": "new|asked_info|interested|payment_link_sent|paid|pending_human|closed|lost",
    "payment_status": "unpaid|paid|refunded|failed",
    "requires_human": false,
    "summary": "resumen breve del lead en 1-2 frases"
  },
  "actions": {
    "send_payment_link": false,
    "payment_link": null,
    "handoff_to_human": false
  }
}`

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return FALLBACK

    const parsed = JSON.parse(jsonMatch[0]) as ClaudeResponse
    return parsed
  } catch {
    return FALLBACK
  }
}
