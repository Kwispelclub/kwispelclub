import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: haal verkopers op
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const profile_id = searchParams.get('profile_id')

  const supabase = getSupabase()

  let query = supabase
    .from('verkopers')
    .select('*, profiles(first_name, last_name, avatar_url, location, created_at)')

  if (slug) {
    query = query.eq('slug', slug).eq('status', 'actief')
  } else if (profile_id) {
    query = query.eq('profile_id', profile_id)
  } else {
    query = query.eq('status', 'actief')
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ verkopers: data || [] })
}

// PATCH: update commissie of status (admin)
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, commissie_pct, status } = body
  const supabase = getSupabase()

  const updates: any = { updated_at: new Date().toISOString() }
  if (commissie_pct !== undefined) updates.commissie_pct = commissie_pct
  if (status !== undefined) updates.status = status
  if (status === 'actief') updates.goedgekeurd_op = new Date().toISOString()

  const { error } = await supabase.from('verkopers').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
