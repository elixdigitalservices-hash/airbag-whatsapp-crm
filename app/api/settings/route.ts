import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const { upserts } = await req.json()
    if (!Array.isArray(upserts) || upserts.length === 0) {
      return NextResponse.json({ error: 'upserts array required' }, { status: 400 })
    }
    const supabase = createServiceClient()
    const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
