'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function BedanktContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const supabase = createClient()
  const [bestelling, setBestelling] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    supabase
      .from('orders')                          // ✅ was 'bestellingen'
      .select('*, order_items(*)')             // ✅ was 'bestelling_items'
      .eq('id', orderId)
      .single()
      .then(({ data }) => { setBestelling(data); setLoading(false) })
  }, [orderId])

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--white:#FFFFFF}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}h1,h2,h3{font-family:'Fredoka',sans-serif}
    .page{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px}
    .card{background:white;border-radius:28px;max-width:560px;width:100%;padding:48px;box-shadow:0 8px 40px rgba(0,0,0,.1);text-align:center;position:relative;overflow:hidden}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,var(--green-main),var(--orange-main))}
    .icon{font-size:72px;margin-bottom:20px;animation:popIn .5s cubic-bezier(.4,0,.2,1)}
    @keyframes popIn{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
    h1{font-size:28px;color:var(--green-dark);margin-bottom:10px}
    p{font-size:15px;color:var(--text-mid);line-height:1.65;margin-bottom:8px}
    .order-box{background:var(--green-pale);border-radius:14px;padding:20px;margin:24px 0;text-align:left}
    .order-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(45,90,39,.1);font-size:14px}
    .order-row:last-child{border-bottom:none;font-weight:700;font-family:'Fredoka',sans-serif;font-size:16px;color:var(--green-dark)}
    .btns{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}
    .btn{flex:1;padding:13px;border-radius:50px;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;text-decoration:none;text-align:center;transition:all .2s;border:none;cursor:pointer}
    .btn-primary{background:var(--green-main);color:white;box-shadow:0 4px 12px rgba(74,124,63,.25)}.btn-primary:hover{background:var(--green-dark)}
    .btn-outline{background:transparent;border:2px solid var(--cream-dark);color:var(--text-mid)}.btn-outline:hover{border-color:var(--green-main);color:var(--green-dark)}
    footer{background:var(--green-dark);color:white}.fi{max-width:600px;margin:0 auto;padding:20px;text-align:center;font-size:12px;opacity:.4}
  `

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="page"><div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 20, color: 'var(--green-main)' }}>🐾 Even laden...</div></div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="page">
        <div className="card">
          <div className="icon">🎉</div>
          <h1>Bedankt voor je bestelling!</h1>
          <p>Je betaling is ontvangen. We sturen je een bevestiging per e-mail.</p>
          {bestelling && (
            <div className="order-box">
              <div className="order-row"><span>Order #</span><span>{bestelling.order_number || bestelling.id?.slice(0,8)}</span></div>
              <div className="order-row"><span>Status</span>
                <span style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:18,height:18,borderRadius:4,background:'#4A7C3F',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11}}>✓</span>
                  {bestelling.status === 'paid' || bestelling.status === 'betaald' ? 'Bevestigd' : 'In behandeling'}
                </span>
              </div>
              {(() => {
                const adres = bestelling.shipping_address
                if (adres && typeof adres === 'object') {
                  const adresStr = [adres.street, adres.postcode, adres.city, adres.country].filter(Boolean).join(', ')
                  return <div className="order-row"><span>Leveradres</span><span style={{fontSize:13}}>{adresStr}</span></div>
                }
                return null
              })()}
              {bestelling.order_items?.map((item: any) => (
                <div key={item.id} className="order-row">
                  <span>{item.product_name || '—'} × {item.quantity || 1}</span>
                  <span>€{Number(item.total_price || item.unit_price * item.quantity || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-row"><span>Totaal</span><span>€{Number(bestelling.total || 0).toFixed(2)}</span></div>
            </div>
          )}
          <div className="btns">
            <a href="/account" className="btn btn-primary">Volg je bestelling →</a>
            <a href="/" className="btn btn-outline">Verder winkelen</a>
          </div>
        </div>
      </div>
      <footer><div className="fi">© 2026 Kwispelclub</div></footer>
    </>
  )
}
