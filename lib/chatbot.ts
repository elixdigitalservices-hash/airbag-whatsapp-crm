import OpenAI from 'openai'
import type { Service, Promotion } from '@/types'

export interface BotResponse {
  reply: string
  lead_updates: {
    name: string | null
    interest: string | null
    selected_service_id: string | null
    status: 'new' | 'asked_info' | 'interested' | 'payment_link_sent' | 'paid' | 'pending_human' | 'closed' | 'lost'
    payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed'
    requires_human: boolean
    summary: string
  }
  actions: {
    send_payment_link: boolean
    payment_link: string | null
    handoff_to_human: boolean
  }
}

const FALLBACK: BotResponse = {
  reply: 'Ahora mismo no puedo confirmar esa información. Contacta directamente con nosotros: 955 542 232 o info@aeairbag.com.',
  lead_updates: {
    name: null, interest: null, selected_service_id: null,
    status: 'asked_info', payment_status: 'unpaid',
    requires_human: false, summary: '',
  },
  actions: { send_payment_link: false, payment_link: null, handoff_to_human: false },
}

function buildSystemPrompt(
  services: Service[],
  promotions: Promotion[],
  settings: Record<string, string>,
  leadSummary?: string | null,
): string {
  const name = settings.school_name ?? 'Autoescuela Airbag'
  const phone = settings.school_phone ?? '955 542 232'
  const email = settings.school_email ?? 'info@aeairbag.com'
  const address = settings.school_address ?? 'C. Navarro Caro, Tomares, Sevilla'
  const hours = settings.school_hours ?? 'L-V 10:00-13:00 y 17:00-20:00'
  const handoff = settings.handoff_message ?? `Para esto es mejor que te atienda directamente el equipo.\n📞 ${phone}\n✉️ ${email}`

  const servicesBlock = services.length > 0
    ? services.map(s => [
        `• ${s.name}`,
        s.price != null ? `  Precio: ${s.price} €` : '  Precio: consultar',
        s.short_description ? `  ${s.short_description}` : '',
        s.includes?.length ? `  Incluye: ${s.includes.join(' · ')}` : '',
        s.payment_link ? `  Link de pago: ${s.payment_link}` : '',
      ].filter(Boolean).join('\n')).join('\n\n')
    : 'No hay servicios cargados aún.'

  const promosBlock = promotions.length > 0
    ? promotions.map(p => `• ${p.title}: ${p.bot_text ?? p.description ?? ''}`).join('\n')
    : 'Sin promociones activas.'

  return `Eres el asistente de ventas por WhatsApp de ${name}, una autoescuela en Sevilla.

Tu misión: atender consultas, resolver dudas sobre precios y servicios, y convertir al interesado en alumno enviándole el link de pago cuando esté listo.

━━━ DATOS DE LA ACADEMIA ━━━
Nombre: ${name}
Teléfono: ${phone}
Email: ${email}
Dirección: ${address}
Horario: ${hours}

━━━ SERVICIOS DISPONIBLES ━━━
${servicesBlock}

━━━ PROMOCIONES ACTIVAS ━━━
${promosBlock}

${leadSummary ? `━━━ HISTORIAL DE ESTE LEAD ━━━\n${leadSummary}\n` : ''}
━━━ REGLAS OBLIGATORIAS ━━━
1. Responde SIEMPRE en español, tono cercano y profesional.
2. Responde SOLO sobre temas de la autoescuela y el carnet de conducir.
3. NO inventes precios, fechas de examen, ni disponibilidad concreta.
4. NO prometas aprobar ni garantices resultados.
5. Si el usuario está listo para pagar → pon send_payment_link: true y payment_link con el link del servicio.
6. Deriva a humano (requires_human: true, handoff_to_human: true) si:
   - Pide hablar con una persona
   - Hay problema con un pago ya realizado
   - Pregunta por fecha concreta de examen DGT
   - Caso especial (recuperación de puntos, empresa, etc.)
   Mensaje de derivación: "${handoff}"
7. Actualiza el status del lead según la conversación:
   - new → asked_info (primer contacto con preguntas)
   - asked_info → interested (muestra interés real)
   - interested → payment_link_sent (quiere pagar)
   - payment_link_sent → paid (confirma que pagó)
8. Extrae el nombre si el usuario lo menciona.
9. El campo "summary" resume en 1-2 frases quién es el lead y qué quiere.

━━━ FORMATO DE RESPUESTA ━━━
Responde ÚNICAMENTE con un objeto JSON válido, sin texto fuera del JSON:

{
  "reply": "mensaje para WhatsApp (texto plano, emojis permitidos, saltos de línea con \\n)",
  "lead_updates": {
    "name": null,
    "interest": null,
    "selected_service_id": null,
    "status": "new|asked_info|interested|payment_link_sent|paid|pending_human|closed|lost",
    "payment_status": "unpaid|paid|refunded|failed",
    "requires_human": false,
    "summary": "resumen breve del lead"
  },
  "actions": {
    "send_payment_link": false,
    "payment_link": null,
    "handoff_to_human": false
  }
}`
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
}): Promise<BotResponse> {
  const activeServices = services.filter(s => s.active)
  const activePromotions = promotions.filter(p => {
    if (!p.active) return false
    const now = new Date()
    if (p.starts_at && new Date(p.starts_at) > now) return false
    if (p.ends_at && new Date(p.ends_at) < now) return false
    return true
  })

  const systemPrompt = buildSystemPrompt(activeServices, activePromotions, settings, leadSummary)

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(text) as BotResponse
    return parsed
  } catch (err) {
    console.error('[chatbot] OpenAI error:', err)
    return FALLBACK
  }
}
