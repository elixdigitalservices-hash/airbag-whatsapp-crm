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
  const body = await req.json()

  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ok' })
  }

  const userPhone = message.from as string
  const userText = (message.text?.body ?? '') as string

  const supabase = createServiceClient()

  // Busca o crea el lead
  const { data: existingLead } = await supabase
    .from('leads').select('*').eq('phone', userPhone).single()

  let lead = existingLead
  if (!lead) {
    const { data: newLead } = await supabase
      .from('leads')
      .insert({ phone: userPhone, status: 'new', source: 'whatsapp' })
      .select().single()
    lead = newLead
  }
  if (!lead) return NextResponse.json({ status: 'ok' })

  // Guarda mensaje entrante
  await supabase.from('messages').insert({
    lead_id: lead.id,
    direction: 'inbound',
    sender_type: 'user',
    content: userText,
    whatsapp_message_id: message.id,
  })

  // Comprueba si el bot está activo
  const { data: botSetting } = await supabase
    .from('settings').select('value').eq('key', 'chatbot_active').single()

  const isBotActive = botSetting?.value !== false && botSetting?.value !== 'false' && botSetting?.value !== '"false"'

  if (!isBotActive || lead.requires_human) {
    // Solo guarda el mensaje, no responde
    return NextResponse.json({ status: 'ok' })
  }

  // Carga contexto en paralelo
  const [servicesRes, promosRes, settingsRes, historyRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true).order('sort_order'),
    supabase.from('promotions').select('*').eq('active', true),
    supabase.from('settings').select('key, value'),
    supabase.from('messages').select('direction, content')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: true })
      .limit(20),
  ])

  // Parsea settings
  const settings: Record<string, string> = {}
  for (const row of settingsRes.data ?? []) {
    try {
      settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : String(row.value ?? '')
    } catch {
      settings[row.key] = String(row.value ?? '')
    }
  }

  // Historial de conversación (excluye el mensaje actual que acaba de llegar)
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
    settings,
    leadSummary: lead.summary,
  })

  // Guarda respuesta del bot
  await supabase.from('messages').insert({
    lead_id: lead.id,
    direction: 'outbound',
    sender_type: 'bot',
    content: botResponse.reply,
  })

  // Actualiza el lead con los datos detectados
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
  if (lu.requires_human) updates.requires_human = lu.requires_human
  if (lu.summary) updates.summary = lu.summary

  await supabase.from('leads').update(updates).eq('id', lead.id)

  // Envía la respuesta principal
  await sendWhatsAppMessage(userPhone, botResponse.reply)

  // Si el bot decidió enviar link de pago, lo envía como mensaje separado
  if (botResponse.actions.send_payment_link && botResponse.actions.payment_link) {
    await new Promise(r => setTimeout(r, 800))
    await sendWhatsAppMessage(userPhone, `🔗 Aquí tienes el link para completar el pago:\n${botResponse.actions.payment_link}`)
    await supabase.from('messages').insert({
      lead_id: lead.id,
      direction: 'outbound',
      sender_type: 'bot',
      content: `🔗 Link de pago enviado: ${botResponse.actions.payment_link}`,
    })
    await supabase.from('leads').update({ status: 'payment_link_sent', updated_at: new Date().toISOString() }).eq('id', lead.id)
  }

  return NextResponse.json({ status: 'ok' })
}
