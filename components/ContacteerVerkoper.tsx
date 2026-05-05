'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Props {
  receiverId: string        // profile_id van de verkoper
  productId?: string        // optioneel product id
  productNaam?: string      // voor context in het bericht
  listingId?: string        // optioneel listing id (2dehands)
  verkoperId?: string       // optioneel verkopers tabel id
}

export default function ContacteerVerkoper({ receiverId, productId, productNaam, listingId, verkoperId }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [bericht, setBericht] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!bericht.trim()) return
    setSending(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth?redirect=' + window.location.pathname
        return
      }

      if (user.id === receiverId) {
        setError('Je kunt geen bericht sturen naar jezelf.')
        setSending(false)
        return
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: receiverId,
          product_id: productId || null,
          verkoper_id: verkoperId || null,
          message: bericht.trim(),
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSent(true)
      setBericht('')
    } catch (e: any) {
      setError(e.message || 'Er ging iets mis')
    }
    setSending(false)
  }

  if (sent) return (
    <div style={{
      padding: '12px 16px', borderRadius: 12,
      background: '#E8F0E4', color: '#2D5A27',
      fontSize: 13, fontWeight: 700, textAlign: 'center'
    }}>
      ✓ Bericht verstuurd! Check je <a href="/account?panel=berichten" style={{ color: '#2D5A27' }}>inbox</a>.
    </div>
  )

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 50,
            border: '2px solid #4A7C3F', background: 'transparent',
            color: '#4A7C3F', fontFamily: 'Fredoka, sans-serif',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all .2s', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6
          }}
          onMouseOver={e => { (e.target as HTMLElement).style.background = '#E8F0E4' }}
          onMouseOut={e => { (e.target as HTMLElement).style.background = 'transparent' }}
        >
          💬 Contacteer verkoper
        </button>
      ) : (
        <div style={{
          border: '2px solid #E8F0E4', borderRadius: 12,
          padding: 14, background: '#FFF9F0'
        }}>
          {productNaam && (
            <div style={{ fontSize: 12, color: '#8A8A8A', fontWeight: 600, marginBottom: 8 }}>
              Over: <strong style={{ color: '#2D5A27' }}>{productNaam}</strong>
            </div>
          )}
          <textarea
            placeholder="Stel een vraag of doe een bod..."
            value={bericht}
            onChange={e => setBericht(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              border: '2px solid #F5EDE0', borderRadius: 10,
              fontFamily: 'Nunito, sans-serif', fontSize: 13,
              minHeight: 80, resize: 'vertical', outline: 'none',
              background: 'white', boxSizing: 'border-box'
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: '#E84E4E', fontWeight: 600, marginTop: 6 }}>⚠️ {error}</div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={handleSend}
              disabled={sending || !bericht.trim()}
              style={{
                flex: 1, padding: '10px', borderRadius: 50,
                background: '#4A7C3F', color: 'white', border: 'none',
                fontFamily: 'Fredoka, sans-serif', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', opacity: sending || !bericht.trim() ? .6 : 1
              }}
            >
              {sending ? 'Bezig...' : 'Verstuur →'}
            </button>
            <button
              onClick={() => { setOpen(false); setBericht('') }}
              style={{
                padding: '10px 16px', borderRadius: 50,
                border: '2px solid #F5EDE0', background: 'transparent',
                fontFamily: 'Fredoka, sans-serif', fontSize: 13,
                color: '#8A8A8A', cursor: 'pointer'
              }}
            >
              Annuleer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
