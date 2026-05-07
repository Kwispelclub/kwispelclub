'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Message {
  role: 'user' | 'assistant'
  content: string
  data?: {
    producten?: any[]
    kapsalons?: any[]
    listings?: any[]
    cursussen?: any[]
  }
}

// Pagina-specifieke quick buttons
const QUICK_BY_PAGE: Record<string, string[]> = {
  '/': ['#jeuk', '#puppy', '#vlooien', 'Kapsalon boeken', '2de Hands', 'Cursussen'],
  '/winkel': ['#jeuk', '#puppy', '#voeding', '#speelgoed', '#tuigje', '#bench'],
  '/2dehands': ['Bench zoeken', 'Speelgoed', 'Tuigje', 'Voeding', 'Wat mag ik vragen?'],
  '/puppy-training': ['Puppy training', 'Cursussen bekijken', 'Word trainer', '#training'],
  '/kapsalons': ['Kapsalon vinden', 'Trimmen', 'Grooming', 'Afspraak boeken'],
  '/blog': ['Tips honden', 'Voeding advies', '#puppy', '#senior'],
}

export default function KwispelChat() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoginHint, setShowLoginHint] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Pagina-specifieke welkomstberichten
  const getWelkomBericht = (naam: string, pagina: string) => {
    if (pagina.startsWith('/winkel')) return `Hoi ${naam}! 🐾 Ik ben Kwispel. Zoek een product met #jeuk, #puppy of #voeding, dan vind ik de beste opties!`
    if (pagina === '/2dehands') return `Hoi ${naam}! ♻️ Zoek tweedehands spullen of vraag mij advies. Typ bijv. "bench" of "tuigje".`
    if (pagina === '/puppy-training') return `Hoi ${naam}! 🎓 Ik help je met cursussen en trainingsvragen. Wat wil je leren?`
    if (pagina === '/kapsalons') return `Hoi ${naam}! ✂️ Ik help je een kapsalon vinden. Typ je stad of vraag naar groomingdiensten!`
    return `Hallo ${naam}! 🐾 Ik ben Kwispel. Stel me een vraag of zoek op #jeuk, #vlooien of #puppy!`
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
  }, [])

  useEffect(() => {
    if (open && messages.length === 0 && user) {
      const naam = user.user_metadata?.first_name || 'baasje'
      setMessages([{ role: 'assistant', content: getWelkomBericht(naam, pathname) }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open, user])

  // Reset berichten bij paginawissel
  useEffect(() => {
    if (open && user) {
      const naam = user.user_metadata?.first_name || 'baasje'
      setMessages([{ role: 'assistant', content: getWelkomBericht(naam, pathname) }])
    }
  }, [pathname])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleToggle = () => {
    if (!user) { setShowLoginHint(true); setTimeout(() => setShowLoginHint(false), 3000); return }
    setOpen(o => !o)
  }

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const newMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, newMsg])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/kwispel-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history, pagina: pathname }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, ik kon even geen antwoord vinden. Probeer het nog eens! 🐾',
        data: data.data,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oeps, er ging iets mis! Probeer het even opnieuw 🐾' }])
    }
    setLoading(false)
  }

  const addToCart = (product: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem('kc_cart') || '[]')
      const existing = cart.findIndex((i: any) => i.id === product.id)
      if (existing >= 0) cart[existing].aantal++
      else cart.push({ id: product.id, naam: product.naam, prijs: product.prijs, emoji: product.emoji || '🐾', aantal: 1 })
      localStorage.setItem('kc_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      alert(`✅ ${product.naam} toegevoegd aan je winkelwagen!`)
    } catch {}
  }

  // Pagina-specifieke quick buttons
  const quickButtons = QUICK_BY_PAGE[pathname] || QUICK_BY_PAGE['/']

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .kw-root{position:fixed;bottom:24px;right:24px;z-index:9999;font-family:Nunito,sans-serif}
        .kw-fab{width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#2D5A27,#4A7C3F);box-shadow:0 4px 20px rgba(45,90,39,.45);display:flex;align-items:center;justify-content:center;font-size:26px;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative}
        .kw-fab:hover{transform:scale(1.1) rotate(-5deg);box-shadow:0 8px 32px rgba(45,90,39,.55)}
        .kw-fab.open{background:linear-gradient(135deg,#E8913A,#D4812E)}
        .kw-fab::before{content:'';position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(74,124,63,.3);animation:kwPulse 2.5s ease-out infinite}
        @keyframes kwPulse{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
        .kw-hint{position:absolute;bottom:70px;right:0;padding:8px 14px;border-radius:12px;font-size:13px;font-weight:700;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.15);animation:hintIn .2s ease;pointer-events:none;color:white}
        .kw-hint.login{background:#E8913A}.kw-hint.login::after{content:'';position:absolute;bottom:-6px;right:20px;width:12px;height:12px;background:#E8913A;clip-path:polygon(0 0,100% 0,50% 100%)}
        @keyframes hintIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .kw-window{position:absolute;bottom:72px;right:0;width:380px;height:560px;background:#FFF9F0;border-radius:24px;box-shadow:0 12px 56px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;animation:winIn .3s cubic-bezier(.4,0,.2,1);border:1px solid rgba(45,90,39,.08)}
        @keyframes winIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        .kw-header{background:linear-gradient(135deg,#2D5A27,#4A7C3F);padding:16px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0}
        .kw-av{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:22px;border:2px solid rgba(255,255,255,.25);flex-shrink:0}
        .kw-hinfo{flex:1}.kw-name{font-family:Fredoka,sans-serif;font-size:17px;font-weight:700;color:white;line-height:1}
        .kw-status{font-size:12px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:5px;margin-top:3px}
        .kw-dot{width:7px;height:7px;border-radius:50%;background:#6EE272;flex-shrink:0;animation:blink 2s ease-in-out infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .kw-close{background:rgba(255,255,255,.12);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0}
        .kw-close:hover{background:rgba(255,255,255,.25)}
        .kw-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
        .kw-msgs::-webkit-scrollbar{width:4px}.kw-msgs::-webkit-scrollbar-thumb{background:rgba(45,90,39,.2);border-radius:4px}
        .msg{max-width:88%;display:flex;flex-direction:column;gap:4px}
        .msg.user{align-self:flex-end;align-items:flex-end}.msg.assistant{align-self:flex-start;align-items:flex-start}
        .msg-bubble{padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;word-break:break-word}
        .msg.user .msg-bubble{background:linear-gradient(135deg,#2D5A27,#4A7C3F);color:white;border-bottom-right-radius:6px}
        .msg.assistant .msg-bubble{background:white;color:#2C2C2C;border-bottom-left-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        .typing-bubble{background:white;padding:12px 16px;border-radius:18px;border-bottom-left-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;gap:5px;align-items:center}
        .typing-dot{width:7px;height:7px;border-radius:50%;background:#4A7C3F;animation:typeBounce 1.2s ease-in-out infinite}
        .typing-dot:nth-child(2){animation-delay:.15s}.typing-dot:nth-child(3){animation-delay:.3s}
        @keyframes typeBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}
        .result-cards{display:flex;flex-direction:column;gap:6px;margin-top:8px;max-width:100%}
        .result-card{background:white;border-radius:12px;padding:10px 12px;box-shadow:0 1px 4px rgba(0,0,0,.08);border:1.5px solid #F5EDE0;font-size:13px}
        .result-card.product{border-color:#E8F0E4}.result-card.kapsalon{border-color:#FFF3E0}.result-card.listing{border-color:#E0F5F1}.result-card.cursus{border-color:#EDE8F5}
        .rc-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
        .rc-emoji{font-size:20px;flex-shrink:0}.rc-naam{font-weight:700;color:#2C2C2C;flex:1;line-height:1.2}
        .rc-prijs{font-family:Fredoka,sans-serif;font-weight:700;color:#2D5A27;font-size:15px}
        .rc-meta{font-size:11px;color:#8A8A8A;margin-bottom:6px}
        .rc-btns{display:flex;gap:6px;flex-wrap:wrap}
        .rc-btn{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:50px;font-size:12px;font-weight:700;border:none;cursor:pointer;transition:all .2s;font-family:Nunito,sans-serif}
        .rc-btn.cart{background:#E8F0E4;color:#2D5A27}.rc-btn.cart:hover{background:#4A7C3F;color:white}
        .rc-btn.link{background:#F5EDE0;color:#5A5A5A;text-decoration:none}.rc-btn.link:hover{background:#E8913A;color:white}
        .rc-btn.teal{background:#E0F5F1;color:#2A9D8F;text-decoration:none}.rc-btn.teal:hover{background:#2A9D8F;color:white}
        .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#8A8A8A;margin-bottom:4px;margin-top:8px}
        .kw-quick{padding:0 16px 8px;display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0}
        .quick-btn{padding:6px 12px;border-radius:50px;border:1.5px solid #E8F0E4;background:white;font-family:Nunito,sans-serif;font-size:12px;font-weight:700;color:#4A7C3F;cursor:pointer;transition:all .2s;white-space:nowrap}
        .quick-btn:hover{background:#E8F0E4;border-color:#4A7C3F}
        .kw-input-row{padding:12px 16px;display:flex;gap:8px;align-items:center;border-top:1px solid #F5EDE0;background:white;flex-shrink:0}
        .kw-input{flex:1;padding:10px 14px;border:2px solid #F5EDE0;border-radius:50px;font-family:Nunito,sans-serif;font-size:14px;outline:none;transition:border .2s;background:#FFF9F0;color:#2C2C2C}
        .kw-input:focus{border-color:#6B9E5E;background:white}.kw-input::placeholder{color:#8A8A8A}
        .kw-send{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#2D5A27,#4A7C3F);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .2s;flex-shrink:0}
        .kw-send:hover:not(:disabled){transform:scale(1.08);box-shadow:0 4px 12px rgba(45,90,39,.35)}.kw-send:disabled{opacity:.4;cursor:not-allowed}
        @media(max-width:480px){.kw-window{width:calc(100vw - 32px);right:-8px;height:500px}}
      `}} />

      <div className="kw-root">
        {showLoginHint && <div className="kw-hint login">🔒 Log in om met Kwispel te chatten</div>}

        {open && user && (
          <div className="kw-window">
            <div className="kw-header">
              <div className="kw-av">🐾</div>
              <div className="kw-hinfo">
                <div className="kw-name">Kwispel</div>
                <div className="kw-status"><div className="kw-dot" />Zoekt mee in onze database</div>
              </div>
              <button className="kw-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="kw-msgs">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-bubble">{m.content}</div>

                  {m.role === 'assistant' && m.data && (
                    <div className="result-cards">
                      {/* Producten */}
                      {m.data.producten && m.data.producten.length > 0 && (
                        <>
                          <div className="section-label">🛍️ Producten</div>
                          {m.data.producten.map((p: any) => (
                            <div key={p.id} className="result-card product">
                              <div className="rc-header">
                                <span className="rc-emoji">{p.emoji || '🐾'}</span>
                                <span className="rc-naam">{p.naam}</span>
                                <span className="rc-prijs">€{parseFloat(p.prijs).toFixed(2)}</span>
                              </div>
                              <div className="rc-btns">
                                <button className="rc-btn cart" onClick={() => addToCart(p)}>🛒 In winkelwagen</button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {/* Kapsalons */}
                      {m.data.kapsalons && m.data.kapsalons.length > 0 && (
                        <>
                          <div className="section-label">✂️ Kapsalons</div>
                          {m.data.kapsalons.map((k: any) => (
                            <div key={k.id} className="result-card kapsalon">
                              <div className="rc-header">
                                <span className="rc-emoji">✂️</span>
                                <span className="rc-naam">{k.naam}</span>
                              </div>
                              <div className="rc-meta">📍 {k.stad || k.locatie}</div>
                              <div className="rc-btns">
                                <a href="/kapsalons" className="rc-btn link">Bekijk & Boek →</a>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {/* 2de Hands */}
                      {m.data.listings && m.data.listings.length > 0 && (
                        <>
                          <div className="section-label">♻️ 2de Hands</div>
                          {m.data.listings.map((l: any) => (
                            <div key={l.id} className="result-card listing">
                              <div className="rc-header">
                                <span className="rc-emoji">♻️</span>
                                <span className="rc-naam">{l.titel}</span>
                                <span className="rc-prijs">€{l.vraagprijs}</span>
                              </div>
                              <div className="rc-meta">📍 {l.locatie}</div>
                              <div className="rc-btns">
                                <a href="/2dehands" className="rc-btn link">Bekijk →</a>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {/* Cursussen */}
                      {m.data.cursussen && m.data.cursussen.length > 0 && (
                        <>
                          <div className="section-label">🎓 Cursussen</div>
                          {m.data.cursussen.map((c: any) => (
                            <div key={c.id} className="result-card cursus">
                              <div className="rc-header">
                                <span className="rc-emoji">🎓</span>
                                <span className="rc-naam">{c.title}</span>
                              </div>
                              <div className="rc-meta">{c.total_modules} modules · {c.total_lessons} lessen</div>
                              <div className="rc-btns">
                                <a href={`/cursus/${c.id}`} className="rc-btn teal">Start cursus →</a>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="msg assistant">
                  <div className="typing-bubble">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="kw-quick">
                {quickButtons.map(q => (
                  <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            )}

            <div className="kw-input-row">
              <input
                ref={inputRef}
                className="kw-input"
                placeholder="Stel een vraag of typ #jeuk..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button className="kw-send" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        )}

        <button className={`kw-fab ${open ? 'open' : ''}`} onClick={handleToggle}>
          {open ? '✕' : '🐾'}
        </button>
      </div>
    </>
  )
}
