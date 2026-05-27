import { NextRequest, NextResponse } from 'next/server'
import { getLeadById, getMessagesByLeadId, getNotesByLeadId } from '@/lib/db'

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
