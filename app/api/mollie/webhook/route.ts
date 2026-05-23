import { NextRequest, NextResponse } from 'next/server'

async function createNotification(userId: string, type: string, title: string, message?: string, link?: string) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, message: message || null, link: link || null })
}
import { createClient } from '@supabase/supabase-js'
import createMollieClient from '@mollie/api-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
)

export async function POST(req: NextRequest) {
  try {
    // Mollie stuurt soms formData, soms JSON — handel beide af
    let paymentId: string | null = null
    const contentType = req.headers.get('content-type') || ''

    try {
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const body = await req.formData()
        paymentId = body.get('id') as string
      } else {
        try {
          const body = await req.json()
          // hook.ping stuurt type: "hook.ping" — geen betaling
          if (body.type && body.type !== 'payment') {
            return NextResponse.json({ ok: true })
          }
          paymentId = body.id || body.paymentId || null
        } catch {
          const text = await req.text()
          const match = text.match(/id=([^&]+)/)
          if (match) paymentId = decodeURIComponent(match[1])
        }
      }
    } catch {
      // Body parsing mislukt (bijv. hook.ping) — gewoon doorgaan met null
    }

    // Mollie ping of event zonder payment ID — gewoon 200 teruggeven
    if (!paymentId || paymentId.startsWith('event_') || paymentId.startsWith('hook_')) {
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
      .update({ status: 'paid', payment_id: paymentId })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single()

    if (!order) return NextResponse.json({ ok: true })

    // Update voorraad per product
    for (const item of (order.order_items || [])) {
      if (item.product_id && item.quantity) {
        const { data: product } = await supabase
          .from('products')
          .select('voorraad')
          .eq('id', item.product_id)
          .single()
        if (product && product.voorraad !== null) {
          const nieuweVoorraad = Math.max(0, (product.voorraad || 0) - item.quantity)
          await supabase
            .from('products')
            .update({ voorraad: nieuweVoorraad })
            .eq('id', item.product_id)
        }
      }
    }

    const leveradres = order.leveradres || order.shipping_address || {}

    // Notificatie aan koper
    if (order.buyer_id) {
      await createNotification(
        order.buyer_id,
        'bestelling_betaald',
        '✅ Bestelling bevestigd!',
        `Je bestelling ${order.order_number} is betaald en wordt verwerkt.`,
        '/account?panel=orders'
      )
    }

    if (meta?.customerEmail) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bestelling_bevestiging',
          to: meta.customerEmail,
          data: {
            firstName: meta.customerName?.split(' ')[0] || 'Klant',
            orderNummer: order.order_number || order.id?.slice(0,8),
            items: (order.order_items || []).map((i: any) => ({
              naam: i.product_name || '—',
              aantal: i.quantity || 1,
              prijs: i.unit_price || 0,
            })),
            totaal: Number(order.total || 0),
            leveradres: typeof leveradres === 'object'
              ? [leveradres.street, leveradres.postcode, leveradres.city, leveradres.country].filter(Boolean).join(', ')
              : leveradres || '—',
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

      // Notificatie aan verkoper
      await createNotification(
        sellerId as string,
        'nieuwe_bestelling',
        '📦 Nieuwe bestelling!',
        `Je hebt een nieuwe bestelling ontvangen: ${order.order_number}`,
        '/verkoper/dashboard'
      )

      if (!sellerEmail) continue

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nieuwe_bestelling_verkoper',
          to: sellerEmail,
          data: {
            shopNaam: (verkoper as any)?.shop_naam,
            items: sellerItems.map((i: any) => ({
              naam: i.product_name || '—',
              aantal: i.quantity || 1,
              prijs: i.unit_price || 0,
            })),
            koperNaam: meta?.customerName,
            leveradres: typeof leveradres === 'object'
              ? [leveradres.street, leveradres.postcode, leveradres.city, leveradres.country].filter(Boolean).join(', ')
              : leveradres || '—',
            orderId: order.order_number || order.id?.slice(0,8),
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
