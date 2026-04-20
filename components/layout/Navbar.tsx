'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/kapsalons', label: 'Kapsalons' },
  { href: '/2dehands', label: '2de Hands' },
  { href: '/blog', label: 'Blog' },
  { href: '/over-ons', label: 'Over Ons' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`sticky top-0 z-[100] transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#FFF9F0]/96 shadow-md border-black/5'
            : 'bg-[#FFF9F0]/88 border-black/[0.04]'
        }`}
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-[1320px] mx-auto flex items-center h-[72px] px-4 md:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2.5 no-underline mr-7 shrink-0">
            <div className="w-[42px] h-[42px] rounded-xl bg-[#2D5A27] flex items-center justify-center text-[22px]">
              🐾
            </div>
            <span className="font-heading text-[22px] font-bold text-[#2D5A27] tracking-[0.5px]">
              Kwispelclub
            </span>
          </Link>

          <ul className="hidden md:flex gap-0.5 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#2C2C2C] font-semibold text-sm px-4 py-2 rounded-[10px] hover:bg-[#E8F0E4] hover:text-[#2D5A27] transition-all no-underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <button className="w-11 h-11 rounded-full border-none bg-white flex items-center justify-center text-lg shadow-sm hover:bg-[#E8F0E4] hover:-translate-y-0.5 transition-all cursor-pointer relative">
              🛒
              <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] rounded-full bg-[#E8913A] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-[#FFF9F0]">
                0
              </span>
            </button>
            <Link
              href="/auth"
              className="hidden sm:flex px-5 py-2.5 rounded-full bg-[#4A7C3F] text-white font-heading text-[13px] font-semibold no-underline hover:bg-[#2D5A27] hover:-translate-y-0.5 transition-all shadow-[0_2px_8px_rgba(74,124,63,0.2)]"
            >
              Inloggen
            </Link>
          </div>

          <button
            className="md:hidden bg-transparent border-none text-[26px] cursor-pointer p-2 ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed top-[72px] left-0 right-0 bg-[#FFF9F0] px-6 py-4 pb-6 z-[99] shadow-lg rounded-b-2xl animate-slideDown"
          style={{ animation: 'slideDown 0.3s ease' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3.5 font-semibold text-base text-[#2C2C2C] no-underline border-b border-[#F5EDE0]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="block mt-4 text-center py-3 rounded-full bg-[#4A7C3F] text-white font-heading font-semibold no-underline"
            onClick={() => setMobileOpen(false)}
          >
            Inloggen / Registreren
          </Link>
        </div>
      )}
    </>
  )
}
