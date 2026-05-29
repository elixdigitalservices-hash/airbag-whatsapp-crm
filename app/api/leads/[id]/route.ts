import { NextRequest, NextResponse } from 'next/server'
import { getLeadById, getMessagesByLeadId, getNotesByLeadId } from '@/lib/db'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lead, messages, notes] = await Promise.all([
    getLeadById(id),
    getMessagesByLeadId(id),
    getNotesByLeadId(id),
  ])
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ lead, messages, notes })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('leads')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
