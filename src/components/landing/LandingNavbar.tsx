'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface LandingNavbarProps {
  transparent?: boolean
}

export default function LandingNavbar({ transparent = false }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-white/80 backdrop-blur-lg' : 'bg-white'} border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl font-black text-black">N</span>
              <span className="text-2xl font-black text-[#5BB5E0]">A</span>
              <span className="w-2 h-2 rounded-full bg-[#5BB5E0] ml-0.5 -mt-3"></span>
            </div>
            <span className="text-sm font-semibold text-gray-700">Automation</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/landing/recursos" className="text-gray-600 hover:text-[#5BB5E0] transition-colors font-medium">
              Recursos
            </Link>
            <Link href="/landing/planos" className="text-gray-600 hover:text-[#5BB5E0] transition-colors font-medium">
              Planos
            </Link>
            <Link href="/landing/depoimentos" className="text-gray-600 hover:text-[#5BB5E0] transition-colors font-medium">
              Depoimentos
            </Link>
            <Link
              href="/landing/login"
              className="text-gray-600 hover:text-[#5BB5E0] transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/landing/login?register=true"
              className="bg-[#5BB5E0] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#4AA5D0] transition-all hover:shadow-lg hover:shadow-[#5BB5E0]/25"
            >
              Começar Agora
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="flex flex-col gap-4 px-4">
            <Link href="/landing/recursos" className="text-gray-600 hover:text-[#5BB5E0] font-medium">Recursos</Link>
            <Link href="/landing/planos" className="text-gray-600 hover:text-[#5BB5E0] font-medium">Planos</Link>
            <Link href="/landing/depoimentos" className="text-gray-600 hover:text-[#5BB5E0] font-medium">Depoimentos</Link>
            <Link href="/landing/login" className="text-gray-600 hover:text-[#5BB5E0] font-medium">Login</Link>
            <Link
              href="/landing/login?register=true"
              className="bg-[#5BB5E0] text-white px-6 py-2.5 rounded-full font-semibold text-center"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
