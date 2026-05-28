import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getChatbotReply } from '@/lib/chatbot'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import type { Service, Promotion } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  // Responder a Meta inmediatamente para evitar reintentos por timeout
  const body = await req.json()

  const entry = body?.entry?.[0]
  const change = entry?.changes?.[0]?.value
  const message = change?.messages?.[0]

  // Ignorar si no hay mensaje de texto entrante
  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ok' })
  }

  // Ignorar mensajes echo (enviados desde el propio número de negocio)
  if (message.from === process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json({ status: 'ok' })
  }

  const userPhone = message.from as string
  const userText = (message.text?.body ?? '').trim() as string
  const waMessageId = message.id as string

  if (!userText) return NextResponse.json({ status: 'ok' })

  const supabase = createServiceClient()

  try {
    // Deduplicación: si ya procesamos este mensaje, ignorar
    const { data: alreadyProcessed } = await supabase
      .from('messages')
      .select('id')
      .eq('whatsapp_message_id', waMessageId)
      .maybeSingle()

    if (alreadyProcessed) {
      return NextResponse.json({ status: 'ok' })
    }

    // Busca el lead existente
    const { data: existingLead } = await supabase
      .from('leads').select('*').eq('phone', userPhone).maybeSingle()

    let lead = existingLead
    if (!lead) {
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({ phone: userPhone, status: 'new', source: 'whatsapp' })
        .select().single()

      if (insertError) {
        // Race condition: otro request ya lo creó — reintentamos la lectura
        const { data: retryLead } = await supabase
          .from('leads').select('*').eq('phone', userPhone).single()
        lead = retryLead
      } else {
        lead = newLead
      }
    }

    if (!lead) {
      console.error('[webhook] No se pudo crear/encontrar lead para', userPhone)
      return NextResponse.json({ status: 'ok' })
    }

    // Guarda mensaje entrante (con el wa message id para dedup futuro)
    await supabase.from('messages').insert({
      lead_id: lead.id,
      direction: 'inbound',
      sender_type: 'user',
      content: userText,
      whatsapp_message_id: waMessageId,
    })

    // Comprueba si el bot está activo
    const { data: botSetting } = await supabase
      .from('settings').select('value').eq('key', 'chatbot_active').single()

    const rawBotValue = botSetting?.value
    const isBotActive = rawBotValue !== false
      && rawBotValue !== 'false'
      && rawBotValue !== '"false"'
      && rawBotValue !== null

    if (!isBotActive) {
      await supabase.from('leads').update({ last_message: userText, updated_at: new Date().toISOString() }).eq('id', lead.id)
      return NextResponse.json({ status: 'ok' })
    }

    // Carga contexto en paralelo
    const [servicesRes, promosRes, settingsRes, historyRes] = await Promise.all([
      supabase.from('services').select('*').eq('active', true).order('sort_order'),
      supabase.from('promotions').select('*').eq('active', true),
      supabase.from('settings').select('key, value'),
      supabase.from('messages')
        .select('direction, content')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: true })
        .limit(30),
    ])

    // Parsea settings manteniendo los tipos originales
    const settings: Record<string, unknown> = {}
    for (const row of settingsRes.data ?? []) {
      try {
        settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : (row.value ?? '')
      } catch {
        settings[row.key] = String(row.value ?? '')
      }
    }

    // Historial de conversación (excluye el mensaje actual)
    const history = (historyRes.data ?? [])
      .slice(0, -1)
      .map(m => ({
        role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))

    // Llama al bot
    const botResponse = await getChatbotReply({
      userMessage: userText,
      conversationHistory: history,
      services: (servicesRes.data ?? []) as Service[],
      promotions: (promosRes.data ?? []) as Promotion[],
      settings: settings as Record<string, unknown>,
      leadSummary: lead.summary,
    })

    // Guarda respuesta del bot
    await supabase.from('messages').insert({
      lead_id: lead.id,
      direction: 'outbound',
      sender_type: 'bot',
      content: botResponse.reply,
    })

    // Actualiza el lead
    const updates: Record<string, unknown> = {
      last_message: userText,
      updated_at: new Date().toISOString(),
    }
    const lu = botResponse.lead_updates
    if (lu.name) updates.name = lu.name
    if (lu.interest) updates.interest = lu.interest
    if (lu.selected_service_id) updates.selected_service_id = lu.selected_service_id
    if (lu.status) updates.status = lu.status
    if (lu.payment_status) updates.payment_status = lu.payment_status
    if (typeof lu.requires_human === 'boolean') updates.requires_human = lu.requires_human
    if (lu.summary) updates.summary = lu.summary

    await supabase.from('leads').update(updates).eq('id', lead.id)

    // Envía la respuesta por WhatsApp
    const sent = await sendWhatsAppMessage(userPhone, botResponse.reply)
    if (!sent) {
      console.error('[webhook] Error enviando mensaje WhatsApp a', userPhone, '— posible token caducado')
    }

    // Link de pago como mensaje separado
    if (botResponse.actions.send_payment_link && botResponse.actions.payment_link) {
      await new Promise(r => setTimeout(r, 800))
      const paymentMsg = `🔗 Aquí tienes el link para completar el pago:\n${botResponse.actions.payment_link}`
      await sendWhatsAppMessage(userPhone, paymentMsg)
      await supabase.from('messages').insert({
        lead_id: lead.id,
        direction: 'outbound',
        sender_type: 'bot',
        content: paymentMsg,
      })
      await supabase.from('leads').update({ status: 'payment_link_sent', updated_at: new Date().toISOString() }).eq('id', lead.id)
    }

  } catch (err) {
    console.error('[webhook] Error procesando mensaje:', err)
  }

  return NextResponse.json({ status: 'ok' })
}
