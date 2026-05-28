export type LeadStatus =
  | 'new'
  | 'asked_info'
  | 'interested'
  | 'payment_link_sent'
  | 'paid'
  | 'pending_human'
  | 'closed'
  | 'lost'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'

export interface Lead {
  id: string
  name: string | null
  phone: string
  email: string | null
  interest: string | null
  selected_service_id: string | null
  selected_pack: string | null
  status: LeadStatus
  payment_status: PaymentStatus
  stripe_customer_id: string | null
  last_message: string | null
  summary: string | null
  source: string
  requires_human: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  lead_id: string
  direction: 'inbound' | 'outbound'
  sender_type: 'user' | 'bot' | 'human'
  content: string
  whatsapp_message_id: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  category: string | null
  price: number | null
  short_description: string | null
  includes: string[] | null
  extras: { name: string; price: number }[] | null
  payment_link: string | null
  active: boolean
  sort_order: number
  internal_notes: string | null
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  title: string
  description: string | null
  bot_text: string | null
  active: boolean
  starts_at: string | null
  ends_at: string | null
  service_ids: string[] | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  lead_id: string | null
  stripe_payment_id: string | null
  stripe_checkout_session_id: string | null
  stripe_customer_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  product_name: string | null
  service_id: string | null
  amount: number | null
  currency: string
  status: string
  paid_at: string | null
  raw_payload: Record<string, unknown> | null
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: unknown
  created_at: string
  updated_at: string
}

export interface InternalNote {
  id: string
  lead_id: string
  note: string
  created_at: string
}

/** @deprecated use BotResponse from lib/chatbot */
export interface ClaudeResponse {
  reply: string
  lead_updates: {
    name: string | null
    interest: string | null
    selected_service_id: string | null
    status: LeadStatus
    payment_status: PaymentStatus
    requires_human: boolean
    summary: string
  }
  actions: {
    send_payment_link: boolean
    payment_link: string | null
    handoff_to_human: boolean
  }
}
