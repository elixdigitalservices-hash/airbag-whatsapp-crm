import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const customerEmail = session.customer_details?.email ?? null
    const customerPhone = session.customer_details?.phone ?? null
    const customerName = session.customer_details?.name ?? null
    const amount = session.amount_total ?? null
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null

    let leadId: string | null = null

    if (customerEmail) {
      const { data } = await supabase.from('leads').select('id').eq('email', customerEmail).single()
      if (data) leadId = data.id
    }

    if (!leadId && customerPhone) {
      const phone = customerPhone.replace(/\D/g, '')
      const { data } = await supabase.from('leads').select('id').eq('phone', phone).single()
      if (data) leadId = data.id
    }

    if (!leadId && stripeCustomerId) {
      const { data } = await supabase.from('leads').select('id').eq('stripe_customer_id', stripeCustomerId).single()
      if (data) leadId = data.id
    }

    await supabase.from('payments').insert({
      lead_id: leadId,
      stripe_checkout_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      amount,
      currency: session.currency ?? 'eur',
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      raw_payload: event.data.object as unknown as Record<string, unknown>,
    })

    if (leadId) {
      await supabase.from('leads').update({
        status: 'paid',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      }).eq('id', leadId)
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent

    let leadId: string | null = null

    if (pi.receipt_email) {
      const { data } = await supabase.from('leads').select('id').eq('email', pi.receipt_email).single()
      if (data) leadId = data.id
    }

    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_payment_id', pi.id)
      .single()

    if (!existing) {
      await supabase.from('payments').insert({
        lead_id: leadId,
        stripe_payment_id: pi.id,
        stripe_customer_id: typeof pi.customer === 'string' ? pi.customer : null,
        customer_email: pi.receipt_email,
        amount: pi.amount_received,
        currency: pi.currency,
        status: 'succeeded',
        paid_at: new Date().toISOString(),
        raw_payload: event.data.object as unknown as Record<string, unknown>,
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent

    await supabase.from('payments').upsert({
      stripe_payment_id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: 'failed',
      raw_payload: event.data.object as unknown as Record<string, unknown>,
    }, { onConflict: 'stripe_payment_id' })
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null

    if (piId) {
      await supabase.from('payments').update({ status: 'refunded' }).eq('stripe_payment_id', piId)
    }
  }

  return NextResponse.json({ received: true })
}
