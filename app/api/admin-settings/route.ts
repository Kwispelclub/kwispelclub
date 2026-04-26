import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: haal instellingen op
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')

    if (error) throw error

    // Zet array om naar object { key: value }
    const settings: Record<string, any> = {}
    data?.forEach(row => { settings[row.key] = row.value })

    return NextResponse.json({ settings })
  } catch {
    // Als tabel nog niet bestaat, stuur defaults terug
    return NextResponse.json({
      settings: {
        demo_webshop: true,
        demo_kapsalons: true,
        demo_2dehands: true,
        demo_academy: true,
        demo_blog: true,
        demo_verkopers: true,
        demo_reviews: true,
        site_in_beta: true,
        beta_bericht: '🚀 Kwispelclub is in opbouw! Webshop & boekingen zijn nog niet actief.',
      }
    })
  }
}

// POST: sla instelling op
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) return NextResponse.json({ error: 'key vereist' }, { status: 400 })

    const supabase = getSupabase()
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
