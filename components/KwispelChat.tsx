'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `Je bent Kwispel, de vrolijke en speelse AI-assistent van Kwispelclub — het Belgische platform voor huisdiereigenaren.

Je persoonlijkheid:
- Enthousiast, warm en speels — je bent dol op huisdieren 🐾
- Gebruik af en toe emoji's (🐾 🐶 🐱 ✂️ ♻️ 🎓) maar overdrijf niet
- Spreek de gebruiker aan als "baasje" of bij voornaam als je die weet
- Antwoord altijd in het Nederlands
- Houd antwoorden bondig (max 3-4 zinnen), tenzij een uitgebreide uitleg nodig is

Wat je weet over Kwispelclub:
- Platform voor huisdiereigenaren in België en Nederland
- SHOP: biologische voeding, speelgoed, verzorging, tuigjes en meer
- KAPSALONS (/kapsalons): vind en boek hondentrimsalons in jouw regio. Momenteel voorbeeldsalons — boekingen komen binnenkort
- 2DE HANDS (/2dehands): koop en verkoop gebruikte huisdierproducten. Vereist: aankoop in laatste 3 maanden, max 2 advertenties. Max 70% van nieuwprijs
- ACADEMY (/puppy-training): gratis cursussen, o.a. Puppy Training Basics (8 modules, 24 lessen, trainer Lisa van den Berg). Certificaat bij voltooiing
- ACCOUNT (/account): beheer huisdieren, vaccinaties, bestellingen, favorieten, afspraken en academy-voortgang
- AUTH (/auth): registreren als koper, verkoper of kapsalon. Google OAuth beschikbaar
- COMMUNITY: forum en tips — binnenkort beschikbaar
- Kwispelclub is momenteel in opbouw (beta). Webshop, betalingen en boekingen komen binnenkort

Navigatie — verwijs naar deze links:
- Shop → /#shop
- Kapsalons → /kapsalons
- 2de Hands → /2dehands
- Academy/Puppy Training → /puppy-training
- Account → /account
- Inloggen/Registreren → /auth

Als iemand vraagt over iets wat nog niet beschikbaar is, wees eerlijk maar positief over de toekomst.
Als iemand een specifieke vraag stelt die je niet kunt beantwoorden, zeg dan dat je het niet weet en stel voor contact op te nemen via de website.`

export default function KwispelChat() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoginHint, setShowLoginHint] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
  }, [])

  useEffect(() => {
    if (open && messages.length === 0 && user) {
      const name = user.user_metadata?.first_name || 'baasje'
      setMessages([{
        role: 'assistant',
        content: `Hallo ${name}! 🐾 Ik ben Kwispel, jouw Kwispelclub-assistent. Waarmee kan ik je helpen?`
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleToggle = () => {
    if (!user) {
      setShowLoginHint(true)
      setTimeout(() => setShowLoginHint(false), 3000)
      return
    }
    setOpen(o => !o)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: 'user', content: userMsg }],
        }),
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Sorry, ik kon even geen antwoord vinden. Probeer het nog eens! 🐾'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oeps, er ging iets mis! Probeer het even opnieuw 🐾' }])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Parse links in assistant messages
  const renderMessage = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(?<!\[)(\/[a-z0-9#/-]+)/g
    const parts: (string | JSX.Element)[] = []
    let last = 0
    let match

    const processedContent = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => `LINK:${text}:${url}:LINK`)

    processedContent.split(/(LINK:[^:]+:[^:]+:LINK)/).forEach((part, i) => {
      if (part.startsWith('LINK:')) {
        const [, text, url] = part.replace(':LINK', '').split(':')
        parts.push(<a key={i} href={url} style={{ color: 'var(--green-dark)', fontWeight: 700, textDecoration: 'underline' }}>{text}</a>)
      } else {
        parts.push(part)
      }
    })

    return parts
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap');

        .kwispel-root { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Nunito', sans-serif; }

        /* FAB BUTTON */
        .kwispel-fab {
          width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg, #2D5A27, #4A7C3F);
          box-shadow: 0 4px 20px rgba(45,90,39,.45); display: flex; align-items: center;
          justify-content: center; font-size: 26px; transition: all .3s cubic-bezier(.4,0,.2,1);
          position: relative;
        }
        .kwispel-fab:hover { transform: scale(1.1) rotate(-5deg); box-shadow: 0 8px 32px rgba(45,90,39,.55); }
        .kwispel-fab.open { transform: scale(1.05); background: linear-gradient(135deg, #E8913A, #D4812E); }

        /* PULSE RING */
        .kwispel-fab::before {
          content: ''; position: absolute; inset: -6px; border-radius: 50%;
          border: 2px solid rgba(74,124,63,.3); animation: kwispelPulse 2.5s ease-out infinite;
        }
        @keyframes kwispelPulse { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5); } }

        /* TOOLTIP */
        .kwispel-hint {
          position: absolute; bottom: 70px; right: 0; background: #2D5A27; color: white;
          padding: 8px 14px; border-radius: 12px; font-size: 13px; font-weight: 700;
          white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,.15);
          animation: hintIn .2s ease; pointer-events: none;
        }
        .kwispel-hint::after { content: ''; position: absolute; bottom: -6px; right: 20px; width: 12px; height: 12px; background: #2D5A27; clip-path: polygon(0 0, 100% 0, 50% 100%); }
        .kwispel-hint.login { background: #E8913A; }
        .kwispel-hint.login::after { background: #E8913A; }
        @keyframes hintIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        /* CHAT WINDOW */
        .kwispel-window {
          position: absolute; bottom: 72px; right: 0;
          width: 360px; height: 520px;
          background: #FFF9F0; border-radius: 24px;
          box-shadow: 0 12px 56px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
          display: flex; flex-direction: column; overflow: hidden;
          animation: windowIn .3s cubic-bezier(.4,0,.2,1);
          border: 1px solid rgba(45,90,39,.08);
        }
        @keyframes windowIn { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* HEADER */
        .kwispel-header {
          background: linear-gradient(135deg, #2D5A27, #4A7C3F);
          padding: 16px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .kwispel-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,.15); display: flex; align-items: center;
          justify-content: center; font-size: 22px; border: 2px solid rgba(255,255,255,.25);
          flex-shrink: 0;
        }
        .kwispel-header-info { flex: 1; }
        .kwispel-name { font-family: 'Fredoka', sans-serif; font-size: 17px; font-weight: 700; color: white; line-height: 1; }
        .kwispel-status { font-size: 12px; color: rgba(255,255,255,.75); display: flex; align-items: center; gap: 5px; margin-top: 3px; }
        .kwispel-dot { width: 7px; height: 7px; border-radius: 50%; background: #6EE272; flex-shrink: 0; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
        .kwispel-close { background: rgba(255,255,255,.12); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: background .2s; flex-shrink: 0; }
        .kwispel-close:hover { background: rgba(255,255,255,.25); }

        /* MESSAGES */
        .kwispel-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .kwispel-messages::-webkit-scrollbar { width: 4px; }
        .kwispel-messages::-webkit-scrollbar-track { background: transparent; }
        .kwispel-messages::-webkit-scrollbar-thumb { background: rgba(45,90,39,.2); border-radius: 4px; }

        .msg { max-width: 85%; display: flex; flex-direction: column; gap: 4px; }
        .msg.user { align-self: flex-end; align-items: flex-end; }
        .msg.assistant { align-self: flex-start; align-items: flex-start; }

        .msg-bubble {
          padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5;
          word-break: break-word;
        }
        .msg.user .msg-bubble { background: linear-gradient(135deg, #2D5A27, #4A7C3F); color: white; border-bottom-right-radius: 6px; }
        .msg.assistant .msg-bubble { background: white; color: #2C2C2C; border-bottom-left-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }

        /* TYPING */
        .typing-bubble { background: white; padding: 12px 16px; border-radius: 18px; border-bottom-left-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.06); display: flex; gap: 5px; align-items: center; }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #4A7C3F; animation: typingBounce 1.2s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation-delay: .15s; }
        .typing-dot:nth-child(3) { animation-delay: .3s; }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-6px); opacity: 1; } }

        /* QUICK REPLIES */
        .kwispel-quick { padding: 0 16px 8px; display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }
        .quick-btn { padding: 6px 12px; border-radius: 50px; border: 1.5px solid #E8F0E4; background: white; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #4A7C3F; cursor: pointer; transition: all .2s; white-space: nowrap; }
        .quick-btn:hover { background: #E8F0E4; border-color: #4A7C3F; }

        /* INPUT */
        .kwispel-input-row { padding: 12px 16px; display: flex; gap: 8px; align-items: center; border-top: 1px solid #F5EDE0; background: white; flex-shrink: 0; }
        .kwispel-input { flex: 1; padding: 10px 14px; border: 2px solid #F5EDE0; border-radius: 50px; font-family: 'Nunito', sans-serif; font-size: 14px; outline: none; transition: border .2s; background: #FFF9F0; color: #2C2C2C; }
        .kwispel-input:focus { border-color: #6B9E5E; background: white; }
        .kwispel-input::placeholder { color: #8A8A8A; }
        .kwispel-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: linear-gradient(135deg, #2D5A27, #4A7C3F); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all .2s; flex-shrink: 0; }
        .kwispel-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 12px rgba(45,90,39,.35); }
        .kwispel-send:disabled { opacity: .4; cursor: not-allowed; }

        @media (max-width: 480px) {
          .kwispel-window { width: calc(100vw - 32px); right: -8px; height: 480px; }
        }
      `}</style>

      <div className="kwispel-root">
        {/* Login hint */}
        {showLoginHint && (
          <div className="kwispel-hint login">🔒 Log eerst in om met Kwispel te chatten</div>
        )}

        {/* Chat window */}
        {open && user && (
          <div className="kwispel-window">
            {/* Header */}
            <div className="kwispel-header">
              <div className="kwispel-avatar">🐾</div>
              <div className="kwispel-header-info">
                <div className="kwispel-name">Kwispel</div>
                <div className="kwispel-status"><div className="kwispel-dot" />Online — altijd klaar voor je!</div>
              </div>
              <button className="kwispel-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="kwispel-messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-bubble">{renderMessage(m.content)}</div>
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

            {/* Quick replies — alleen als er nog geen messages zijn (behalve welkom) */}
            {messages.length <= 1 && (
              <div className="kwispel-quick">
                {['Wat is Kwispelclub?', 'Kapsalon boeken', '2de Hands info', 'Puppy cursus'].map(q => (
                  <button key={q} className="quick-btn" onClick={() => { setInput(q); setTimeout(() => sendMessage(), 10) }}>{q}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="kwispel-input-row">
              <input
                ref={inputRef}
                className="kwispel-input"
                placeholder="Stel een vraag aan Kwispel..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
              />
              <button className="kwispel-send" onClick={sendMessage} disabled={!input.trim() || loading}>
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        )}

        {/* FAB */}
        <button className={`kwispel-fab ${open ? 'open' : ''}`} onClick={handleToggle} aria-label="Chat met Kwispel">
          {open ? '✕' : '🐾'}
        </button>

        {/* Hover tooltip als niet ingelogd */}
        {!user && !showLoginHint && (
          <div className="kwispel-hint" style={{ opacity: 0, pointerEvents: 'none' }}>Kwispel — Log in om te chatten</div>
        )}
      </div>
    </>
  )
}
