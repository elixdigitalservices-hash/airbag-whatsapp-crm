import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { note } = await req.json()
    if (!note?.trim()) return NextResponse.json({ error: 'Note required' }, { status: 400 })
    const supabase = createServiceClient()
    const { error } = await supabase.from('internal_notes').insert({ lead_id: id, note: note.trim() })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
