import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST: maak Mollie betaling aan voor cursus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cursus_id, user_id, bedrag } = body

    if (!cursus_id || !user_id || !bedrag) {
      return NextResponse.json({ error: 'cursus_id, user_id en bedrag zijn verplicht' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Check of cursus bestaat
    const { data: cursus } = await supabase
      .from('cursussen')
      .select('id, titel, prijs, is_gratis')
      .eq('id', cursus_id)
      .eq('gepubliceerd', true)
      .single()

    if (!cursus) return NextResponse.json({ error: 'Cursus niet gevonden' }, { status: 404 })
    if (cursus.is_gratis) return NextResponse.json({ error: 'Cursus is gratis' }, { status: 400 })

    // Check of al gekocht
    const { data: bestaand } = await supabase
      .from('cursus_aankopen')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('cursus_id', cursus_id)
      .single()

    if (bestaand?.status === 'paid') {
      return NextResponse.json({ error: 'Al gekocht' }, { status: 400 })
    }

    const mollieMode = process.env.MOLLIE_MODE || 'test'
    const mollieKey = mollieMode === 'live'
      ? process.env.MOLLIE_LIVE_API_KEY
      : process.env.MOLLIE_TEST_API_KEY

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kwispelclub.be'

    // Maak Mollie betaling
    const mollieRes = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: { currency: 'EUR', value: parseFloat(bedrag).toFixed(2) },
        description: `Kwispelclub Academy — ${cursus.titel}`,
        redirectUrl: `${siteUrl}/cursus/${cursus_id}?betaling=succes`,
        cancelUrl: `${siteUrl}/cursus/${cursus_id}?betaling=geannuleerd`,
        webhookUrl: `${siteUrl}/api/cursus-webhook`,
        metadata: { cursus_id, user_id },
      }),
    })

    const mollieData = await mollieRes.json()

    if (!mollieData.id) {
      return NextResponse.json({ error: 'Mollie fout: ' + JSON.stringify(mollieData) }, { status: 500 })
    }

    // Sla aankoop op als pending
    await supabase.from('cursus_aankopen').upsert({
      user_id,
      cursus_id,
      mollie_payment_id: mollieData.id,
      status: 'pending',
      bedrag: parseFloat(bedrag),
    }, { onConflict: 'user_id,cursus_id' })

    return NextResponse.json({ checkout_url: mollieData._links.checkout.href })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
