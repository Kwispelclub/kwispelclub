import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const paymentId = body.get('id') as string
    if (!paymentId) return NextResponse.json({ error: 'geen payment id' }, { status: 400 })

    const mollieMode = process.env.MOLLIE_MODE || 'test'
    const mollieKey = mollieMode === 'live' ? process.env.MOLLIE_LIVE_API_KEY : process.env.MOLLIE_TEST_API_KEY

    // Haal betaling op bij Mollie
    const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mollieKey}` }
    })
    const payment = await res.json()

    const supabase = getSupabase()
    const { cursus_id, user_id } = payment.metadata || {}

    if (!cursus_id || !user_id) return NextResponse.json({ ok: true })

    if (payment.status === 'paid') {
      await supabase.from('cursus_aankopen').update({ status: 'paid' })
        .eq('mollie_payment_id', paymentId)

      // Stuur bevestigingsmail
      const { data: cursus } = await supabase.from('cursussen').select('titel').eq('id', cursus_id).single()
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', user_id).single()

      if (profile?.email && cursus) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cursus_aankoop',
            to: profile.email,
            data: { cursusTitel: cursus.titel, cursusId: cursus_id }
          })
        }).catch(() => {})
      }
    } else if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
      await supabase.from('cursus_aankopen').update({ status: 'failed' })
        .eq('mollie_payment_id', paymentId)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
