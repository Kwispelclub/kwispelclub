import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kwispelclub.be'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { sellerId, orderIds } = await req.json()

    if (!sellerId || !orderIds?.length) {
      return NextResponse.json({ error: 'sellerId en orderIds zijn verplicht' }, { status: 400 })
    }

    // Haal verkoper op met IBAN en email
    const { data: verkoper } = await supabase
      .from('verkopers')
      .select('shop_naam, iban, rekening_naam, commissie_pct, profiles(email)')
      .eq('profile_id', sellerId)
      .single()

    if (!verkoper) {
      return NextResponse.json({ error: 'Verkoper niet gevonden' }, { status: 404 })
    }

    // Haal orders op
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, order_number')
      .in('id', orderIds)

    if (!orders?.length) {
      return NextResponse.json({ error: 'Orders niet gevonden' }, { status: 404 })
    }

    // Bereken bedragen
    const commissiePct = verkoper.commissie_pct || 15
    const brutoBedrag = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0)
    const commissie = brutoBedrag * commissiePct / 100
    const nettoBedrag = brutoBedrag - commissie

    // Datumperiode
    const datums = orders.map(o => new Date(o.created_at))
    const vanDatum = new Date(Math.min(...datums.map(d => d.getTime()))).toLocaleDateString('nl-BE')
    const totDatum = new Date(Math.max(...datums.map(d => d.getTime()))).toLocaleDateString('nl-BE')
    const periode = vanDatum === totDatum ? vanDatum : `${vanDatum} — ${totDatum}`

    // Stuur mail naar verkoper
    const sellerEmail = (verkoper as any)?.profiles?.email
    if (sellerEmail) {
      await fetch(`${APP_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'uitbetaling_verkoper',
          to: sellerEmail,
          data: {
            shopNaam: verkoper.shop_naam,
            periode,
            aantalOrders: orders.length,
            brutoBedrag: brutoBedrag.toFixed(2),
            commissie: commissie.toFixed(2),
            commissiePct,
            bedrag: nettoBedrag.toFixed(2),
            iban: verkoper.iban ? verkoper.iban.replace(/(.{4})/g, '$1 ').trim() : '—',
          }
        })
      })
    }

    // Markeer orders als uitbetaald
    await supabase
      .from('orders')
      .update({ status: 'uitbetaald' })
      .in('id', orderIds)

    return NextResponse.json({
      ok: true,
      bedrag: nettoBedrag.toFixed(2),
      aantalOrders: orders.length,
      emailVerzonden: !!sellerEmail
    })

  } catch (err: any) {
    console.error('Uitbetaling bevestiging fout:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
