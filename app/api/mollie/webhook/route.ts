import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import createMollieClient from '@mollie/api-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()
    const paymentId = body.get('id') as string
    if (!paymentId) return NextResponse.json({ error: 'No payment ID' }, { status: 400 })

    const mollieKey = process.env.MOLLIE_LIVE_API_KEY || process.env.MOLLIE_TEST_API_KEY || ''
    const mollie = createMollieClient({ apiKey: mollieKey })
    const payment = await mollie.payments.get(paymentId)

    if (payment.status !== 'paid') {
      return NextResponse.json({ ok: true })
    }

    const meta = payment.metadata as any
    const orderId = meta?.orderId
    if (!orderId) return NextResponse.json({ ok: true })

    // Update order status
    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'paid', mollie_payment_id: paymentId })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single()

    if (!order) return NextResponse.json({ ok: true })

    // Stuur bevestigingsmail naar koper
    const leveradres = order.leveradres || order.shipping_address || {}
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bestelling_bevestiging',
        to: payment.metadata?.customerEmail,
        data: {
          ownerName: payment.metadata?.customerName,
          orderId: order.id,
          items: order.order_items,
          totaal: order.totaal || order.total,
          leveradres,
        }
      })
    })

    // Stuur mail naar elke unieke verkoper
    const sellerIds = [...new Set((order.order_items || []).map((i: any) => i.verkoper_id).filter(Boolean))]
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
            koperNaam: payment.metadata?.customerName,
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
