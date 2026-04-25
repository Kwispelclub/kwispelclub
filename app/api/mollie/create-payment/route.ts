import { NextRequest, NextResponse } from 'next/server'
import createMollieClient from '@mollie/api-client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kwispelclub.be'

function getMollieClient() {
  const mode = process.env.MOLLIE_MODE || 'test'
  const apiKey = mode === 'live'
    ? process.env.MOLLIE_LIVE_API_KEY!
    : process.env.MOLLIE_TEST_API_KEY!
  return createMollieClient({ apiKey })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,        // bijv. 34.95
      description,   // bijv. "Bestelling #KC-2026-001"
      orderId,       // jouw interne order ID
      orderNummer,   // bijv. "KC-2026-001"
      customerEmail, // voor metadata
      customerName,
      items,         // array van producten
    } = body

    if (!amount || !description || !orderId) {
      return NextResponse.json({ error: 'amount, description en orderId zijn verplicht' }, { status: 400 })
    }

    const mollie = getMollieClient()

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
