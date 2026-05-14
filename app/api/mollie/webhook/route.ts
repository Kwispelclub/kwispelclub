import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import createMollieClient from '@mollie/api-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Mollie stuurt soms formData, soms JSON — handel beide af
    let paymentId: string | null = null
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const body = await req.formData()
      paymentId = body.get('id') as string
    } else {
      try {
        const body = await req.json()
        paymentId = body.id || body.paymentId || null
      } catch {
        const text = await req.text()
        const match = text.match(/id=([^&]+)/)
        if (match) paymentId = decodeURIComponent(match[1])
      }
    }

    if (!paymentId) {
      console.log('Webhook: geen payment ID ontvangen')
      return NextResponse.json({ ok: true })
    }

    // Haal Mollie mode op uit admin_settings
    const { data: modeSetting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'mollie_mode')
      .single()
    const mollieMode = (modeSetting?.value || 'test').replace(/"/g, '')
    const mollieKey = mollieMode === 'live'
      ? (process.env.MOLLIE_LIVE_API_KEY || '')
      : (process.env.MOLLIE_TEST_API_KEY || '')

    const mollie = createMollieClient({ apiKey: mollieKey })
    const payment = await mollie.payments.get(paymentId)

    if (payment.status !== 'paid') {
      console.log(`Webhook: betaling ${paymentId} status = ${payment.status}`)
      return NextResponse.json({ ok: true })
    }

    const meta = payment.metadata as any
    const orderId = meta?.orderId
    if (!orderId) {
      console.log('Webhook: geen orderId in metadata')
      return NextResponse.json({ ok: true })
    }

    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'paid', mollie_payment_id: paymentId })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single()

    if (!order) return NextResponse.json({ ok: true })

    const leveradres = order.leveradres || order.shipping_address || {}

    if (meta?.customerEmail) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bestelling_bevestiging',
          to: meta.customerEmail,
          data: {
            ownerName: meta.customerName,
            orderId: order.id,
            items: order.order_items,
            totaal: order.totaal || order.total,
            leveradres,
          }
        })
      })
    }

    const sellerIds = Array.from(new Set((order.order_items || []).map((i: any) => i.verkoper_id).filter(Boolean)))
    for (const sellerId of sellerIds) {
      const { data: verkoper } = await supabase
        .from('verkopers')
        .select('shop_naam, profiles(email)')
        .eq('profile_id', sellerId)
        .single()

      const sellerItems = order.order_items.filter((i: any) => i.verkoper_id === sellerId)
      const sellerEmail = (verkoper as any)?.profiles?.email
      if (!sellerEmail) continue

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nieuwe_bestelling_verkoper',
          to: sellerEmail,
          data: {
            shopNaam: (verkoper as any)?.shop_naam,
            items: sellerItems,
            koperNaam: meta?.customerName,
            leveradres,
            orderId: order.id,
          }
        })
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Webhook fout:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Mollie stuurt soms een GET request om de webhook te valideren
export async function GET() {
  return NextResponse.json({ ok: true, service: 'kwispelclub-webhook' })
}
