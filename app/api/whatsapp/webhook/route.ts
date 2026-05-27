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

  const entry = body?.entry?.[0]
  const change = entry?.changes?.[0]
  const value = change?.value
  const message = value?.messages?.[0]

  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ok' })
  }

  const userPhone = message.from
  const userText = message.text?.body ?? ''

  const supabase = createServiceClient()

  let lead = null
  const { data: existingLead } = await supabase
    .from('leads')
    .select('*')
    .eq('phone', userPhone)
    .single()

  if (existingLead) {
    lead = existingLead
  } else {
    const { data: newLead } = await supabase
      .from('leads')
      .insert({ phone: userPhone, status: 'new', source: 'whatsapp' })
      .select()
      .single()
    lead = newLead
  }

  if (!lead) return NextResponse.json({ status: 'ok' })

  await supabase.from('messages').insert({
    lead_id: lead.id,
    direction: 'inbound',
    sender_type: 'user',
    content: userText,
    whatsapp_message_id: message.id,
  })

  const chatbotActiveSetting = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'chatbot_active')
    .single()

  const isChatbotActive = chatbotActiveSetting.data?.value !== false && chatbotActiveSetting.data?.value !== 'false'

  if (!isChatbotActive || lead.requires_human) {
    return NextResponse.json({ status: 'ok' })
  }

  const [servicesRes, promotionsRes, settingsRes, historyRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true).order('sort_order'),
    supabase.from('promotions').select('*').eq('active', true),
    supabase.from('settings').select('key, value'),
    supabase.from('messages').select('direction, content').eq('lead_id', lead.id).order('created_at', { ascending: true }).limit(20),
  ])

  const settings: Record<string, string> = {}
  for (const row of settingsRes.data ?? []) {
    try {
      settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : String(row.value ?? '')
    } catch {
      settings[row.key] = String(row.value ?? '')
    }
  }

  const history = (historyRes.data ?? [])
    .slice(0, -1)
    .map(m => ({
      role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))

  const claudeResponse = await getChatbotReply({
    userMessage: userText,
    conversationHistory: history,
    services: (servicesRes.data ?? []) as Service[],
    promotions: (promotionsRes.data ?? []) as Promotion[],
    settings,
    leadSummary: lead.summary,
  })

  await supabase.from('messages').insert({
    lead_id: lead.id,
    direction: 'outbound',
    sender_type: 'bot',
    content: claudeResponse.reply,
  })

  const updates: Record<string, unknown> = {
    last_message: userText,
    updated_at: new Date().toISOString(),
  }

  if (claudeResponse.lead_updates.name) updates.name = claudeResponse.lead_updates.name
  if (claudeResponse.lead_updates.interest) updates.interest = claudeResponse.lead_updates.interest
  if (claudeResponse.lead_updates.selected_service_id) updates.selected_service_id = claudeResponse.lead_updates.selected_service_id
  if (claudeResponse.lead_updates.status) updates.status = claudeResponse.lead_updates.status
  if (claudeResponse.lead_updates.payment_status) updates.payment_status = claudeResponse.lead_updates.payment_status
  if (claudeResponse.lead_updates.requires_human) updates.requires_human = claudeResponse.lead_updates.requires_human
  if (claudeResponse.lead_updates.summary) updates.summary = claudeResponse.lead_updates.summary

  await supabase.from('leads').update(updates).eq('id', lead.id)

  await sendWhatsAppMessage(userPhone, claudeResponse.reply)

  return NextResponse.json({ status: 'ok' })
}
