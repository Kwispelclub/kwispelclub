'use client'

import Link from 'next/link'

export default function LaunchBanner() {
  return (
    <div
      className="text-white text-center py-2.5 px-4 text-[13px] font-semibold tracking-[0.3px] relative z-[101]"
      style={{
        background: 'linear-gradient(90deg, #E8913A, #D4812E, #E8913A)',
        backgroundSize: '200%',
        animation: 'shimmer 3s ease infinite',
      }}
    >
      🚀 Kwispelclub is in opbouw! Webshop & boekingen zijn nog niet actief.{' '}
      <Link href="#early-access" className="text-white underline ml-1.5 font-bold">
        Registreer je voor early access →
      </Link>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}
