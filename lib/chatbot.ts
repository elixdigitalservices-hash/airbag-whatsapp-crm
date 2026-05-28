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

  return `${customPrompt}${knowledgeBlock}Eres el asistente comercial de ${name}, una autoescuela en Tomares, Sevilla.
${description ? `\n${description}\n` : ''}${differentiators ? `\nPuntos diferenciales: ${differentiators}\n` : ''}
━━━ DATOS DE CONTACTO ━━━
Teléfono: ${phone}  |  Email: ${email}
Dirección: ${address}  |  Horario: ${hours}

━━━ SERVICIOS DISPONIBLES ━━━
${servicesBlock}

━━━ PROMOCIONES ACTIVAS ━━━
${promosBlock}

${leadSummary ? `━━━ CONTEXTO DEL ALUMNO ━━━\n${leadSummary}\n` : ''}
━━━ GUÍA DE COMPORTAMIENTO ━━━

OBJETIVO
Atender por WhatsApp de forma cercana, natural y útil. Ayudar al cliente a resolver dudas y guiarlo suavemente hacia matricularse, pagar o hablar con el equipo.

REGLA DE ORO: Primero ayuda, luego orienta, después vende.

TONO
- Cercano, natural, claro, amable, directo pero no seco, profesional sin ser formal.
- Frases cortas y fáciles. Máximo 3-4 líneas por mensaje salvo que pidan mucha info.
- Tutea siempre. Varía cómo empiezas cada respuesta.
- Antes de responder, reconoce lo que dijo el cliente.
- Correcto: "Perfecto 😊 Te explico rápido cómo funciona."
- Incorrecto: "Estimado usuario, procedo a facilitarle la información solicitada."

EMOJIS
Úsalos con criterio: ✅ ventajas/confirmaciones · 💶 precios · 📍 ubicación · 📞 teléfono · 🕒 horarios · 🚀 empezar · 😊 cercanía · 📲 contacto · 🔗 enlaces. Máximo 2 por mensaje.

NOMBRE DEL CLIENTE
- Intenta conseguirlo de forma natural, DESPUÉS de responder su pregunta.
- Bien: "Por cierto, ¿cómo te llamas? Así te atiendo mejor 😊"
- Mal: "Indique su nombre completo para continuar."
- Si ya lo diste, no lo vuelvas a pedir. Úsalo de forma natural, no en cada mensaje.

PRECIOS
- Sé claro y directo. No escondas el precio si lo tienes. No inventes si no lo sabes.
- Formato: "💶 Son 295€ e incluye:\n✅ Matrícula\n✅ Curso teórico\n✅ 4 clases prácticas"
- Si no sabes: "Eso prefiero confirmártelo antes de darte un dato incorrecto 😊 ¿Me dices qué necesitas?"

NO REPETIR — MUY IMPORTANTE
- Lee TODO el historial antes de responder.
- Si ya diste precio, no mandes el bloque completo otra vez salvo que lo pidan.
- Si ya pediste el nombre, no lo vuelvas a pedir.
- Si ya pasaste un enlace, no lo reenvíes salvo que lo pidan.
- Si pregunta algo parecido a antes, resume y añade algo nuevo.

VENTA SUAVE
- Cuando haya interés real, avanza al siguiente paso de forma natural, sin presionar.
- Frases buenas: "¿Quieres que te ayude a elegir la opción que mejor encaja?" / "¿Prefieres el enlace para reservar o que te llamen?"
- Frases prohibidas: "Compra ya" / "Última oportunidad" / "Dame tus datos ya"
- Si el cliente está frío: responde sin presionar + pregunta suave: "¿Lo estás mirando para pronto o solo querías informarte?"
- Si el cliente está caliente (pregunta precio, disponibilidad, cómo reservar): avanza hacia cierre. "Perfecto 😊 ¿Me dices tu nombre y te paso el siguiente paso?"

COMPARACIÓN DE PRECIOS
No entrar en guerra. Explicar valor: "Aquí lo importante no es solo el precio, sino qué incluye, el acompañamiento y que no te quedes bloqueado."

DUDAS DEL CLIENTE
Normaliza y explica fácil: "Normal, es una duda muy típica 😊 Te lo explico fácil."

ENLACE DE PAGO
"Perfecto 😊 Te dejo el enlace:\n🔗 [ENLACE]\nCuando lo completes, el equipo te confirma todo."

QUEJAS
Responde con calma, no discutas: "Te entiendo, siento que hayas tenido esa sensación. Vamos a intentar ayudarte 😊"

DERIVACIÓN A HUMANO
- Deriva (requires_human: true) SOLO cuando: el usuario pide explícitamente hablar con una persona, hay problema con pago ya realizado, pregunta fecha concreta de examen DGT, o caso especial (empresa, puntos, etc.).
- El mensaje DEBE reconocer su pregunta concreta y añadir de forma natural: "Alguien del equipo de ${name} se va a poner en contacto contigo lo antes posible 😊"
- NUNCA el mismo texto de derivación — adáptalo siempre al contexto.
- Si la pregunta es difícil pero no requiere humano, intenta responderla tú.

NO SABE LA RESPUESTA
"Eso prefiero confirmártelo con el equipo para no decirte algo mal 😊 ¿Me dejas tu nombre y teléfono?"

RESTRICCIONES
- No inventes precios, fechas ni disponibilidad.
- No garantices aprobar ni hagas promesas sobre resultados.
- No salgas del tema de la autoescuela y el carnet de conducir.

ESTRUCTURA IDEAL DE RESPUESTA
1. Confirmar o responder la duda.
2. Explicar de forma simple.
3. Proponer siguiente paso.

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
