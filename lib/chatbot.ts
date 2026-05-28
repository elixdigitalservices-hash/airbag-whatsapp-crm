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
  reply: 'Ahora mismo tengo un problema técnico 😅 Puedes llamarnos al 955 542 232 o escribir a info@aeairbag.com y te ayudamos enseguida.',
  lead_updates: {
    name: null, interest: null, selected_service_id: null,
    status: 'asked_info', payment_status: 'unpaid',
    requires_human: false, summary: '',
  },
  actions: { send_payment_link: false, payment_link: null, handoff_to_human: false },
}

function str(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v) || (typeof v === 'object' && v !== null)) return JSON.stringify(v)
  return String(v ?? '')
}

function buildSystemPrompt(
  services: Service[],
  promotions: Promotion[],
  settings: Record<string, unknown>,
  leadSummary?: string | null,
): string {
  const name = str(settings.school_name) || 'Autoescuela Airbag'
  const phone = str(settings.school_phone) || '955 542 232'
  const email = str(settings.school_email) || 'info@aeairbag.com'
  const address = str(settings.school_address) || 'C. Navarro Caro, Tomares, Sevilla'
  const hours = str(settings.school_hours) || 'L-V 10:00-13:00 y 17:00-20:00'
  const description = str(settings.school_description)
  const differentiators = str(settings.school_differentiators)

  // Knowledge base — ya puede venir parseado como array o como string JSON
  let knowledgeBlock = ''
  try {
    const raw = settings.knowledge_base
    const kb: { title: string; content: string }[] = Array.isArray(raw)
      ? raw as { title: string; content: string }[]
      : JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
    if (kb.length > 0) {
      knowledgeBlock = `━━━ BASE DE CONOCIMIENTO ━━━\n` +
        kb.map(k => `## ${k.title}\n${k.content}`).join('\n\n') + '\n\n'
    }
  } catch { /* ignore */ }

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

  // Prompt personalizado del cliente (Ajustes → Prompt)
  const rawSystemPrompt = settings.system_prompt
  const customPrompt = rawSystemPrompt && str(rawSystemPrompt).trim()
    ? `━━━ INSTRUCCIONES PERSONALIZADAS (PRIORIDAD MÁXIMA) ━━━\n${str(rawSystemPrompt).trim()}\n\n`
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

TONO — MUY IMPORTANTE
- Escribe como una persona real, no como un robot ni un formulario.
- Mensajes cortos, directos. Máximo 3-4 líneas por mensaje.
- Español informal pero correcto: tutea siempre, usa contracciones naturales.
- 1 emoji por mensaje máximo, y solo cuando encaje de verdad.
- Varía cómo empiezas cada respuesta: no empieces siempre con "¡Hola!" ni "Claro que sí".
- Reconoce lo que dice el usuario antes de responder (muestra que lo leíste de verdad).
- Cuando algo no lo sabes con certeza, dilo con naturalidad: "eso habría que confirmarlo con el equipo".

NO REPETIR
- Lee TODO el historial antes de responder.
- Si ya diste un precio o explicaste algo, NO lo repitas salvo que lo pidan de nuevo.
- Si el usuario insiste en algo que ya explicaste, responde de forma diferente.

DERIVACIÓN A HUMANO
- Deriva (requires_human: true) SOLO en estos casos: el usuario pide explícitamente hablar con alguien, hay un problema con un pago ya realizado, pregunta por fecha concreta de examen DGT, o caso especial (empresa, puntos, etc.).
- El mensaje de derivación debe reconocer su pregunta concreta + añadir de forma natural: "Alguien del equipo de ${name} se va a poner en contacto contigo lo antes posible 😊".
- NUNCA el mismo texto de derivación dos veces — adáptalo siempre al contexto.
- Si la pregunta es difícil pero no requiere humano, intenta responderla tú.

VENTAS
- Cuando haya interés real, ofrece el link de pago de forma natural, sin presión.
- Si no le interesa un pack, ofrece alternativas. No insistas en el mismo.
- Si ya ofreció precio, no lo repitas — pregunta si tiene alguna duda concreta.

RESTRICCIONES
- No inventes precios, fechas ni disponibilidad que no aparezcan arriba.
- No garantices resultados ni prometas aprobar.
- No salgas del tema de la autoescuela y el carnet de conducir.

PROGRESIÓN DEL LEAD
- new → asked_info (primeras preguntas)
- asked_info → interested (interés real)
- interested → payment_link_sent (envías link de pago)
- payment_link_sent → paid (el usuario confirma que pagó)
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
  settings: Record<string, unknown>
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
      temperature: 0.85,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''

    let parsed: BotResponse
    try {
      parsed = JSON.parse(text) as BotResponse
    } catch {
      // Intenta extraer el JSON si hay texto extra alrededor
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0]) as BotResponse
      } else {
        throw new Error(`JSON inválido: ${text.slice(0, 200)}`)
      }
    }

    return parsed
  } catch (err) {
    console.error('[chatbot] Error:', err)
    return FALLBACK
  }
}
