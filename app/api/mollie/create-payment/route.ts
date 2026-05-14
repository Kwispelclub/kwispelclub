import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import createMollieClient from '@mollie/api-client'

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://kwispelclub.be'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getMollieClient() {
  // Haal mode op uit admin_settings DB (fallback: env var, dan test)
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'mollie_mode')
    .single()
  const mode = (data?.value || process.env.MOLLIE_MODE || 'test').replace(/"/g, '')
  const apiKey = mode === 'live'
    ? process.env.MOLLIE_LIVE_API_KEY!
    : process.env.MOLLIE_TEST_API_KEY!
  return createMollieClient({ apiKey })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      description,
      orderId,
      orderNummer,
      customerEmail,
      customerName,
      items,
    } = body

    if (!amount || !description || !orderId) {
      return NextResponse.json({ error: 'amount, description en orderId zijn verplicht' }, { status: 400 })
    }

    const mollie = await getMollieClient()

    const payment = await mollie.payments.create({
      amount: {
        currency: 'EUR',
        value: parseFloat(amount).toFixed(2),
      },
      description,
      redirectUrl: `${APP_URL}/checkout/bedankt?orderId=${orderId}`,
      webhookUrl: `${APP_URL}/api/mollie/webhook`,
      metadata: {
        orderId,
        orderNummer,
        customerEmail,
        customerName,
        items: JSON.stringify(items || []),
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: payment._links.checkout?.href,
      status: payment.status,
    })
  } catch (err: any) {
    console.error('Mollie create payment error:', err)
    return NextResponse.json({ error: err.message || 'Betaling aanmaken mislukt' }, { status: 500 })
  }
}
