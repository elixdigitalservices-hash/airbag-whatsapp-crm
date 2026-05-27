import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { createServiceClient } from '@/lib/supabase/service'
import { isDemoMode } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { to, message, leadId } = await req.json()

  if (!to || !message) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  if (isDemoMode()) {
    return NextResponse.json({ error: 'demo_mode', message: 'Conecta WhatsApp para enviar mensajes reales' }, { status: 400 })
  }

  const sent = await sendWhatsAppMessage(to, message)
  if (!sent) {
    return NextResponse.json({ error: 'Error al enviar por WhatsApp' }, { status: 500 })
  }

  const supabase = createServiceClient()
  await supabase.from('messages').insert({
    lead_id: leadId,
    direction: 'outbound',
    sender_type: 'human',
    content: message,
  })
  await supabase.from('leads').update({
    last_message: message,
    updated_at: new Date().toISOString(),
  }).eq('id', leadId)

  return NextResponse.json({ ok: true })
}
