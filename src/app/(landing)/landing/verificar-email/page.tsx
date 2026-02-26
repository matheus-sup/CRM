'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'
import { verifyEmail } from '@/lib/actions/landing-auth'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Link inválido. O token de verificação não foi encontrado.')
      return
    }

    const verify = async () => {
      const result = await verifyEmail(token)
      if (result.success) {
        setStatus('success')
        setMessage(result.message || 'Email verificado com sucesso!')
      } else {
        setStatus('error')
        setMessage(result.message || 'Erro ao verificar email')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <LandingNavbar />

      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/landing" className="inline-flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-4xl font-black text-black">N</span>
                <span className="text-4xl font-black text-[#5BB5E0]">A</span>
                <span className="w-3 h-3 rounded-full bg-[#5BB5E0] ml-0.5 -mt-4"></span>
              </div>
              <span className="text-lg font-semibold text-gray-700">Automation</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-[#5BB5E0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-[#5BB5E0]/30 border-t-[#5BB5E0] rounded-full animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando...</h1>
                <p className="text-gray-600">Aguarde enquanto verificamos seu email.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verificado!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                  href="/landing/login"
                  className="inline-flex items-center justify-center w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all"
                >
                  Fazer Login
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro na Verificação</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link
                    href="/landing/login"
                    className="inline-flex items-center justify-center w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all"
                  >
                    Ir para Login
                  </Link>
                  <p className="text-sm text-gray-500">
                    Se seu link expirou, faça login para solicitar um novo email de verificação.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 bg-white rounded-xl p-4 flex items-start gap-3">
            <EnvelopeIcon className="w-5 h-5 text-[#5BB5E0] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                <strong>Dica:</strong> Se não recebeu o email, verifique sua pasta de spam ou lixeira.
              </p>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5BB5E0]/30 border-t-[#5BB5E0] rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
