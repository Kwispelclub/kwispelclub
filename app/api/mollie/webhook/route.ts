import { NextRequest, NextResponse } from 'next/server'
import createMollieClient from '@mollie/api-client'
import { createClient } from '@supabase/supabase-js'

function getMollieClient() {
  const mode = process.env.MOLLIE_MODE || 'test'
  const apiKey = mode === 'live'
    ? process.env.MOLLIE_LIVE_API_KEY!
    : process.env.MOLLIE_TEST_API_KEY!
  return createMollieClient({ apiKey })
}

// Supabase service role client voor server-side writes
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

    if (!paymentId) {
      return NextResponse.json({ error: 'Geen payment ID' }, { status: 400 })
    }

    const mollie = getMollieClient()
    const payment = await mollie.payments.get(paymentId)
    const supabase = getSupabase()

    const { orderId, orderNummer, customerEmail, customerName, items } = payment.metadata as any

    console.log(`Mollie webhook: ${paymentId} → ${payment.status}`)

    switch (payment.status) {
      case 'paid': {
        // 1. Update bestelling status in Supabase
        await supabase
          .from('bestellingen')
          .update({ status: 'bevestigd', updated_at: new Date().toISOString() })
          .eq('id', orderId)

        // 2. Stuur bevestigingsmail
        const parsedItems = JSON.parse(items || '[]')
        const totaal = parseFloat(payment.amount.value)

        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'bestelling_bevestiging',
            to: customerEmail,
            data: {
              firstName: customerName?.split(' ')[0] || 'Baasje',
              orderNummer: orderNummer || orderId?.slice(0, 8),
              items: parsedItems,
              totaal,
            }
          })
        })
        break
      }

      case 'failed':
      case 'expired':
      case 'canceled': {
        // Update bestelling als geannuleerd
        await supabase
          .from('bestellingen')
          .update({ status: 'geannuleerd', updated_at: new Date().toISOString() })
          .eq('id', orderId)
        break
      }

      case 'pending':
      case 'authorized': {
        await supabase
          .from('bestellingen')
          .update({ status: 'in_behandeling', updated_at: new Date().toISOString() })
          .eq('id', orderId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Mollie webhook error:', err)
    // Altijd 200 teruggeven aan Mollie, anders blijft hij retries doen
    return NextResponse.json({ received: true })
  }
}
