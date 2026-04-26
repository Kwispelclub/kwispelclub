import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: haal listings op (publiek + eigen)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categorie = searchParams.get('categorie')
  const search = searchParams.get('search')
  const seller_id = searchParams.get('seller_id')

  const supabase = getSupabase()

  let query = supabase
    .from('listings')
    .select(`
      id, titel, beschrijving, categorie, staat, nieuwprijs,
      vraagprijs, locatie, levering, foto_urls, status,
      views, created_at, seller_id,
      profiles!listings_seller_id_fkey(first_name, last_name, created_at)
    `)
    .order('created_at', { ascending: false })

  if (seller_id) {
    query = query.eq('seller_id', seller_id)
  } else {
    query = query.eq('status', 'actief')
  }

  if (categorie && categorie !== 'all') {
    query = query.eq('categorie', categorie)
  }

  if (search) {
    query = query.or(`titel.ilike.%${search}%,beschrijving.ilike.%${search}%`)
  }

  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ listings: data || [] })
}

// POST: maak nieuwe listing aan
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: body.seller_id,
      titel: body.titel,
      beschrijving: body.beschrijving,
      categorie: body.categorie,
      staat: body.staat,
      nieuwprijs: body.nieuwprijs ? parseFloat(body.nieuwprijs) : null,
      vraagprijs: parseFloat(body.vraagprijs),
      locatie: body.locatie,
      levering: body.levering,
      foto_urls: body.foto_urls || [],
      status: 'actief',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ listing: data })
}

// PATCH: update listing status
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, status, seller_id } = body
  const supabase = getSupabase()

  const { error } = await supabase
    .from('listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', seller_id) // veiligheidscheck

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
