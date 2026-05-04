'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('kc_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('kc_cookie_consent', 'all')
    setVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem('kc_cookie_consent', 'necessary')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        .cookie-overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:9998;backdrop-filter:blur(2px)}
        .cookie-banner{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;background:white;border-radius:20px;padding:28px 32px;max-width:560px;width:calc(100% - 32px);box-shadow:0 8px 40px rgba(0,0,0,.15);border:2px solid #E8F0E4}
        .cookie-banner h3{font-family:'Fredoka',sans-serif;font-size:20px;color:#2D5A27;margin-bottom:10px}
        .cookie-banner p{font-size:13px;color:#5A5A5A;line-height:1.6;margin-bottom:20px}
        .cookie-banner p a{color:#4A7C3F;font-weight:700;text-decoration:none}
        .cookie-btns{display:flex;gap:10px;flex-wrap:wrap}
        .cb-accept{flex:1;padding:12px 20px;border-radius:50px;background:#4A7C3F;color:white;border:none;font-family:'Fredoka',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s}
        .cb-accept:hover{background:#2D5A27}
        .cb-necessary{flex:1;padding:12px 20px;border-radius:50px;background:transparent;color:#5A5A5A;border:2px solid #F5EDE0;font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
        .cb-necessary:hover{border-color:#4A7C3F;color:#2D5A27}
        .cookie-icon{font-size:28px;margin-bottom:10px;display:block}
        @media(max-width:480px){.cookie-btns{flex-direction:column}}
      `}</style>
      <div className="cookie-overlay" onClick={acceptNecessary} />
      <div className="cookie-banner">
        <span className="cookie-icon">🍪</span>
        <h3>Wij gebruiken cookies</h3>
        <p>
          Kwispelclub gebruikt cookies voor een betere ervaring. Noodzakelijke cookies zorgen voor login en winkelwagen.
          Analytische cookies helpen ons de site verbeteren. Lees meer in ons{' '}
          <a href="/privacy?tab=cookies">cookiebeleid</a>.
        </p>
        <div className="cookie-btns">
          <button className="cb-accept" onClick={accept}>
            ✓ Alle cookies accepteren
          </button>
          <button className="cb-necessary" onClick={acceptNecessary}>
            Alleen noodzakelijk
          </button>
        </div>
      </div>
    </>
  )
}
