'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AnnounceBanner() {
  const pathname = usePathname()
  const supabase = createClient()
  const [banner, setBanner] = useState<any>(null)

  useEffect(() => {
    // ✅ maybeSingle() ipv single() — geeft null terug als er geen resultaat is, geen 406
    supabase.from('page_banners')
      .select('*')
      .eq('pagina', pathname)
      .eq('actief', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setBanner(data); return }
        // Geen pagina-specifieke banner → probeer globale (pagina = '*')
        supabase.from('page_banners')
          .select('*')
          .eq('pagina', '*')
          .eq('actief', true)
          .maybeSingle()
          .then(({ data: global }) => setBanner(global || null))
      })
  }, [pathname])

  if (!banner) return null

  const colors: Record<string, { bg: string; text: string; btn: string }> = {
    orange: { bg: 'linear-gradient(90deg,#E8913A,#D4812E)', text: 'white', btn: 'rgba(255,255,255,.2)' },
    green:  { bg: 'linear-gradient(90deg,#2D5A27,#4A7C3F)', text: 'white', btn: 'rgba(255,255,255,.2)' },
    red:    { bg: 'linear-gradient(90deg,#C0392B,#922B21)', text: 'white', btn: 'rgba(255,255,255,.2)' },
    blue:   { bg: 'linear-gradient(90deg,#2471A3,#1A5276)', text: 'white', btn: 'rgba(255,255,255,.2)' },
    teal:   { bg: 'linear-gradient(90deg,#2A9D8F,#1A7A6E)', text: 'white', btn: 'rgba(255,255,255,.2)' },
  }
  const c = colors[banner.kleur] || colors.orange

  return (
    <div style={{
      background: c.bg,
      color: c.text,
      padding: '10px 16px',
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Nunito, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      position: 'relative',
    }}>
      <span>{banner.tekst}</span>
      {banner.link_url && banner.link_tekst && (
        <a href={banner.link_url} style={{
          padding: '4px 14px',
          borderRadius: 50,
          background: c.btn,
          color: c.text,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 12,
          border: '1.5px solid rgba(255,255,255,.3)',
          transition: 'all .2s',
        }}>
          {banner.link_tekst} →
        </a>
      )}
    </div>
  )
}
