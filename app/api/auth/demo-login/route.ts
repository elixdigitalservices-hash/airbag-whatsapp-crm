import { NextRequest, NextResponse } from 'next/server'

const DEMO_EMAIL = 'admin@airbag.com'
const DEMO_PASSWORD = 'airbag2025'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('airbag_demo_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }

  return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('airbag_demo_session')
  return res
}
