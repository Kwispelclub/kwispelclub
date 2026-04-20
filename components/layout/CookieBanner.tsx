'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('kc_cookies')) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleChoice = (choice: string) => {
    localStorage.setItem('kc_cookies', choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[250] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.1)] px-4 md:px-8 lg:px-12 py-5"
      style={{ animation: 'slideUp 0.4s ease' }}
    >
      <div className="max-w-[1320px] mx-auto flex items-center gap-5 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <p className="text-sm text-[#5A5A5A] leading-relaxed">
            🍪 Kwispelclub gebruikt cookies om je ervaring te verbeteren.
            Noodzakelijke cookies zijn altijd actief.{' '}
            <Link href="/privacy.html" className="text-[#4A7C3F] font-bold no-underline">
              Meer info
            </Link>
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={() => handleChoice('reject')}
            className="px-4 py-2.5 rounded-full bg-transparent border-none text-[#8A8A8A] text-[13px] font-semibold cursor-pointer hover:text-[#2C2C2C] transition-colors"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={() => handleChoice('accept')}
            className="px-6 py-2.5 rounded-full bg-[#4A7C3F] text-white border-none font-heading text-sm font-semibold cursor-pointer hover:bg-[#2D5A27] transition-all"
          >
            Alles Accepteren
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  )
}
