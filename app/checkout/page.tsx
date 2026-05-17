'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface CartItem {
  id: string
  naam: string
  prijs: number
  aantal: number
  emoji: string
  seller_id?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'cart' | 'gegevens' | 'betaling'>('cart')

  const [voornaam, setVoornaam] = useState('')
  const [achternaam, setAchternaam] = useState('')
  const [email, setEmail] = useState('')
  const [straat, setStraat] = useState('')
  const [nr, setNr] = useState('')
  const [postcode, setPostcode] = useState('')
  const [stad, setStad] = useState('')
  const [land, setLand] = useState('België')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth?redirect=/checkout')
        return
      }
      setUser(user)
      setVoornaam(user.user_metadata?.first_name || '')
      setAchternaam(user.user_metadata?.last_name || '')
      setEmail(user.email || '')
    })
    try {
      const saved = localStorage.getItem('kc_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch {}
  }, [])

  const totaal = cart.reduce((sum, item) => sum + item.prijs * item.aantal, 0)
  const verzending = totaal >= 50 ? 0 : 4.95
  const totaalInclVerzending = totaal + verzending

  const updateAantal = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, aantal: Math.max(0, item.aantal + delta) } : item
      ).filter(item => item.aantal > 0)
      localStorage.setItem('kc_cart', JSON.stringify(updated))
      return updated
    })
  }

  const handleCheckout = async () => {
    if (!voornaam || !email || !straat || !postcode || !stad) {
      alert('Vul alle verplichte velden in')
      return
    }

    setLoading(true)

    try {
      // 1. Maak order aan in Supabase
      // ✅ was 'bestellingen' → nu 'orders'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user?.id,
          status: 'pending',
          subtotal: totaal,
          shipping_cost: verzending,
          total: totaalInclVerzending,
          shipping_address: {
            name: `${voornaam} ${achternaam}`,
            street: `${straat} ${nr}`,
            postcode,
            city: stad,
            country: land,
          },
          payment_method: 'mollie',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Voeg order items toe
      // ✅ was 'bestelling_items' → nu 'order_items'
      await supabase.from('order_items').insert(
        cart.map(item => ({
          order_id: order.id,
          product_name: item.naam,
          quantity: item.aantal,
          unit_price: item.prijs,
          verkoper_id: item.seller_id || null,
          total_price: item.prijs * item.aantal,
        }))
      )

      // 3. Start Mollie betaling
      const res = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totaalInclVerzending.toFixed(2),
          description: `Bestelling — Kwispelclub`,
          orderId: order.id,
          orderNummer: order.order_number,  // ✅ was order_nummer
          customerEmail: email,
          customerName: `${voornaam} ${achternaam}`,
          items: cart.map(i => ({ naam: i.naam, aantal: i.aantal, prijs: i.prijs })),
        }),
      })

      const { checkoutUrl, error } = await res.json()
      if (error) throw new Error(error)

      // 4. Redirect naar Mollie
      localStorage.removeItem('kc_cart')
      window.location.href = checkoutUrl

    } catch (err: any) {
      console.error(err)
      alert('Er ging iets mis: ' + err.message)
    }
    setLoading(false)
  }

  const CSS = `
    :root{--green-dark:#2D5A27;--green-main:#4A7C3F;--green-pale:#E8F0E4;--orange-main:#E8913A;--orange-pale:#FFF3E0;--cream:#FFF9F0;--cream-dark:#F5EDE0;--text-dark:#2C2C2C;--text-mid:#5A5A5A;--text-light:#8A8A8A;--white:#FFFFFF;--red:#E84E4E}
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--text-dark);-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:'Fredoka',sans-serif}
    .checkout-wrap{max-width:1100px;margin:0 auto;padding:40px clamp(16px,4vw,48px)}
    .checkout-header{margin-bottom:32px}.checkout-header h1{font-size:28px;color:var(--green-dark)}.checkout-header p{font-size:14px;color:var(--text-light);margin-top:4px}
    .steps-bar{display:flex;gap:0;margin-bottom:32px;background:white;border-radius:14px;padding:16px 24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .step{display:flex;align-items:center;gap:8px;flex:1}.step::after{content:'→';color:var(--text-light);margin:0 8px}.step:last-child::after{display:none}
    .step-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;background:var(--cream-dark);color:var(--text-light);flex-shrink:0}
    .step.active .step-num{background:var(--green-main);color:white}.step.done .step-num{background:var(--green-dark);color:white}
    .step-label{font-size:13px;font-weight:700;color:var(--text-light)}.step.active .step-label{color:var(--green-dark)}.step.done .step-label{color:var(--green-main)}
    .checkout-layout{display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start}
    .main-card{background:white;border-radius:20px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .main-card h2{font-size:20px;color:var(--green-dark);margin-bottom:20px}
    .cart-item{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid var(--cream-dark)}
    .cart-item:last-child{border-bottom:none}
    .cart-emoji{font-size:36px;width:60px;height:60px;background:var(--cream);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .cart-info{flex:1}.cart-naam{font-weight:700;font-size:15px;margin-bottom:4px}.cart-prijs{font-size:14px;color:var(--text-light)}
    .cart-qty{display:flex;align-items:center;gap:8px}.qty-btn{width:28px;height:28px;border-radius:50%;border:2px solid var(--cream-dark);background:white;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-weight:700}.qty-btn:hover{border-color:var(--green-main);color:var(--green-main)}.qty-num{font-weight:700;font-size:14px;min-width:24px;text-align:center}
    .cart-subtotaal{font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--green-dark);margin-left:8px}
    .empty-cart{text-align:center;padding:48px;color:var(--text-light)}.empty-cart .ei{font-size:48px;margin-bottom:12px;opacity:.4}
    .field{margin-bottom:16px}.field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}.field input,.field select{width:100%;padding:12px 16px;border:2px solid var(--cream-dark);border-radius:12px;font-family:'Nunito',sans-serif;font-size:14px;outline:none;transition:all .2s}.field input:focus,.field select:focus{border-color:var(--green-main);box-shadow:0 0 0 3px rgba(74,124,63,.1)}
    .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .summary-card{background:white;border-radius:20px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06);position:sticky;top:24px}
    .summary-card h3{font-size:18px;color:var(--green-dark);margin-bottom:16px}
    .summary-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid var(--cream-dark)}.summary-row:last-of-type{border-bottom:none}
    .summary-row.total{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;color:var(--green-dark);padding-top:14px;margin-top:4px}
    .free-shipping{background:var(--green-pale);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:var(--green-dark);text-align:center;margin:12px 0}
    .btn-checkout{width:100%;padding:16px;border-radius:50px;background:var(--green-main);color:white;border:none;font-family:'Fredoka',sans-serif;font-size:17px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(74,124,63,.3);margin-top:16px}
    .btn-checkout:hover:not(:disabled){background:var(--green-dark);transform:translateY(-2px)}.btn-checkout:disabled{opacity:.6;cursor:not-allowed}
    .btn-back{width:100%;padding:12px;border-radius:50px;border:2px solid var(--cream-dark);background:transparent;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;color:var(--text-mid);margin-top:8px;transition:all .2s}.btn-back:hover{border-color:var(--green-main);color:var(--green-main)}
    .mollie-logos{display:flex;justify-content:center;gap:8px;margin-top:16px;opacity:.4;flex-wrap:wrap}
    .mollie-logos span{font-size:11px;font-weight:700;color:var(--text-light)}
    .security-note{text-align:center;font-size:12px;color:var(--text-light);margin-top:10px}
    footer{background:var(--green-dark);color:white;margin-top:48px}.fi{max-width:1100px;margin:0 auto;padding:24px clamp(16px,4vw,48px);text-align:center;font-size:13px;opacity:.4}
    @media(max-width:768px){.checkout-layout{grid-template-columns:1fr}.summary-card{position:static}.field-row{grid-template-columns:1fr}}
  `

  return (
    <>
      <style>{CSS}</style>

      <div className="checkout-wrap">
        <div className="checkout-header">
          <h1>🛒 Afrekenen</h1>
          <p>Veilig betalen via Mollie</p>
        </div>

        <div className="steps-bar">
          {[['cart','Winkelwagen'],['gegevens','Gegevens'],['betaling','Betaling']].map(([id,label]) => (
            <div key={id} className={`step ${step===id?'active':step==='gegevens'&&id==='cart'||step==='betaling'?'done':''}`}>
              <div className="step-num">{id==='cart'?'1':id==='gegevens'?'2':'3'}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div>
            {step === 'cart' && (
              <div className="main-card">
                <h2>🛒 Winkelwagen</h2>
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <div className="ei">🛒</div>
                    <p>Je winkelwagen is leeg</p>
                    <a href="/#shop" style={{ color: 'var(--green-main)', fontWeight: 700, textDecoration: 'none', fontSize: 14, marginTop: 8, display: 'block' }}>Bekijk producten →</a>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-emoji">{item.emoji}</div>
                      <div className="cart-info">
                        <div className="cart-naam">{item.naam}</div>
                        <div className="cart-prijs">€{item.prijs.toFixed(2)} per stuk</div>
                      </div>
                      <div className="cart-qty">
                        <button className="qty-btn" onClick={() => updateAantal(item.id, -1)}>−</button>
                        <span className="qty-num">{item.aantal}</span>
                        <button className="qty-btn" onClick={() => updateAantal(item.id, 1)}>+</button>
                      </div>
                      <div className="cart-subtotaal">€{(item.prijs * item.aantal).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {step === 'gegevens' && (
              <div className="main-card">
                <h2>📦 Levergegevens</h2>
                <div className="field-row">
                  <div className="field"><label>Voornaam *</label><input value={voornaam} onChange={e => setVoornaam(e.target.value)} placeholder="Jan" /></div>
                  <div className="field"><label>Achternaam *</label><input value={achternaam} onChange={e => setAchternaam(e.target.value)} placeholder="Peeters" /></div>
                </div>
                <div className="field"><label>E-mailadres *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@voorbeeld.be" /></div>
                <div className="field-row">
                  <div className="field" style={{ flex: 2 }}><label>Straat *</label><input value={straat} onChange={e => setStraat(e.target.value)} placeholder="Kerkstraat" /></div>
                  <div className="field"><label>Nr *</label><input value={nr} onChange={e => setNr(e.target.value)} placeholder="12" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Postcode *</label><input value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="3960" /></div>
                  <div className="field"><label>Stad *</label><input value={stad} onChange={e => setStad(e.target.value)} placeholder="Bree" /></div>
                </div>
                <div className="field">
                  <label>Land</label>
                  <select value={land} onChange={e => setLand(e.target.value)}>
                    <option>België</option><option>Nederland</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="summary-card">
            <h3>Samenvatting</h3>
            {cart.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.emoji} {item.naam} × {item.aantal}</span>
                <span>€{(item.prijs * item.aantal).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row">
              <span>Verzending</span>
              <span>{verzending === 0 ? '✅ Gratis' : `€${verzending.toFixed(2)}`}</span>
            </div>
            {totaal > 0 && totaal < 50 && (
              <div className="free-shipping">🚚 Nog €{(50 - totaal).toFixed(2)} voor gratis verzending</div>
            )}
            <div className="summary-row total">
              <span>Totaal</span>
              <span>€{totaalInclVerzending.toFixed(2)}</span>
            </div>

            {step === 'cart' && (
              <button className="btn-checkout" onClick={() => setStep('gegevens')} disabled={cart.length === 0}>
                Naar levergegevens →
              </button>
            )}
            {step === 'gegevens' && (
              <>
                <button className="btn-checkout" onClick={handleCheckout} disabled={loading}>
                  {loading ? '⏳ Bezig...' : '🔒 Betalen via Mollie →'}
                </button>
                <button className="btn-back" onClick={() => setStep('cart')}>← Terug</button>
              </>
            )}

            <div className="mollie-logos">
              <span>💳 Bancontact</span><span>·</span>
              <span>💳 iDEAL</span><span>·</span>
              <span>💳 Visa</span><span>·</span>
              <span>💳 Mastercard</span>
            </div>
            <div className="security-note">🔒 Beveiligd door Mollie</div>
          </div>
        </div>
      </div>

      <footer><div className="fi">© 2026 Kwispelclub</div></footer>
    </>
  )
}
