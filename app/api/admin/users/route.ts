import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function POST(request: NextRequest) {
  try {
    const { action, userId, sendMail } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId en action zijn verplicht' }, { status: 400 })
    }

    // Haal gebruiker op
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kwispelclub.be'

    if (action === 'pause') {
      // Pauzeer account
      await supabase.from('profiles').update({ actief: false }).eq('id', userId)

      // Stuur mail indien gewenst
      if (sendMail && profile?.email) {
        await fetch(`${siteUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'account_gepauzeerd',
            to: profile.email,
            data: {
              firstName: profile.first_name || 'Gebruiker',
              contactEmail: 'info@kwispelclub.be',
            }
          })
        }).catch(() => {})
      }

      return NextResponse.json({ ok: true, action: 'paused' })
    }

    if (action === 'unpause') {
      await supabase.from('profiles').update({ actief: true }).eq('id', userId)
      return NextResponse.json({ ok: true, action: 'unpaused' })
    }

    if (action === 'delete') {
      // Stuur mail VOOR verwijderen
      if (sendMail && profile?.email) {
        await fetch(`${siteUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'account_verwijderd',
            to: profile.email,
            data: {
              firstName: profile.first_name || 'Gebruiker',
              contactEmail: 'info@kwispelclub.be',
            }
          })
        }).catch(() => {})
      }

      // Verwijder uit auth.users (cascade verwijdert ook profile)
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      return NextResponse.json({ ok: true, action: 'deleted' })
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })

  } catch (err: any) {
    console.error('Admin users error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
