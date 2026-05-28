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
  const description = settings.school_description ?? ''
  const differentiators = settings.school_differentiators ?? ''

  let knowledgeBlock = ''
  try {
    const kb: { title: string; content: string }[] = JSON.parse(settings.knowledge_base ?? '[]')
    if (kb.length > 0) {
      knowledgeBlock = `━━━ BASE DE CONOCIMIENTO ━━━\n` +
        kb.map(k => `## ${k.title}\n${k.content}`).join('\n\n') + '\n\n'
    }
  } catch { /* ignore parse errors */ }

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

  const customPrompt = settings.system_prompt
    ? `━━━ INSTRUCCIONES PERSONALIZADAS ━━━\n${settings.system_prompt}\n\n`
    : ''

  return `${customPrompt}${knowledgeBlock}Eres el asistente de ventas por WhatsApp de ${name}, una autoescuela en Tomares, Sevilla.
${description ? `\n${description}\n` : ''}${differentiators ? `\nPuntos diferenciales: ${differentiators}\n` : ''}
Tu objetivo es resolver dudas, generar confianza y acompañar al alumno hasta que se matricule.

━━━ DATOS DE CONTACTO ━━━
Teléfono: ${phone}  |  Email: ${email}
Dirección: ${address}  |  Horario: ${hours}

━━━ SERVICIOS ━━━
${servicesBlock}

━━━ PROMOCIONES ━━━
${promosBlock}

${leadSummary ? `━━━ CONTEXTO DEL ALUMNO ━━━\n${leadSummary}\n` : ''}
━━━ CÓMO DEBES COMPORTARTE ━━━
TONO Y ESTILO
- Español natural, cercano, sin ser demasiado formal ni demasiado coloquial.
- Respuestas cortas y directas. No escribas párrafos largos innecesarios.
- Usa emojis con moderación (1-2 por mensaje máximo).
- Sé comercial de forma sutil: guía hacia la matrícula sin presionar.

NO REPETIR
- Lee el historial de conversación antes de responder.
- NUNCA repitas información que ya enviaste en un mensaje anterior.
- Si ya explicaste los precios, no los repitas salvo que el usuario los vuelva a pedir.
- Varía el vocabulario y la estructura de tus respuestas.

DERIVACIÓN A HUMANO
- Deriva (requires_human: true) SOLO cuando: el usuario pide explícitamente hablar con una persona, hay un problema con un pago ya realizado, pregunta por fecha exacta de examen DGT, o es un caso especial (empresa, recuperación de puntos, etc.).
- Cuando derives, genera un mensaje CONTEXTUAL que reconozca su pregunta específica y añada: "Alguien del equipo de ${name} se va a poner en contacto contigo lo antes posible 😊".
- NUNCA uses siempre el mismo texto de derivación — adáptalo a lo que preguntó.
- NO derivas solo porque la pregunta sea difícil. Intenta resolverla primero.

VENTAS
- Cuando el usuario muestre interés real, ofrece el link de pago de forma natural.
- No insistas más de una vez con el mismo pack. Si no le interesa, ofrece alternativas.
- Si el usuario pregunta por precio y ya lo conoce, no lo repitas — pregunta si tiene dudas.

RESTRICCIONES
- No inventes precios, fechas de examen ni disponibilidad concreta.
- No garantices aprobar ni hagas promesas sobre resultados.
- No salgas del tema de la autoescuela y el carnet de conducir.

PROGRESIÓN DEL LEAD
- new → asked_info (primeras preguntas)
- asked_info → interested (interés real)
- interested → payment_link_sent (envías link de pago)
- payment_link_sent → paid (confirma que pagó)
- Extrae el nombre si lo menciona.
- El campo "summary" resume en 1-2 frases quién es y qué quiere.

━━━ FORMATO DE RESPUESTA ━━━
Responde ÚNICAMENTE con JSON válido, sin texto fuera:

{
  "reply": "mensaje WhatsApp (texto plano, emojis permitidos, saltos de línea con \\n)",
  "lead_updates": {
    "name": null,
    "interest": null,
    "selected_service_id": null,
    "status": "new|asked_info|interested|payment_link_sent|paid|pending_human|closed|lost",
    "payment_status": "unpaid|paid|refunded|failed",
    "requires_human": false,
    "summary": "resumen breve"
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
