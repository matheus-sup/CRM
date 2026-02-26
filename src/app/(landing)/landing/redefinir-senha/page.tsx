'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'
import { resetPassword } from '@/lib/actions/landing-auth'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setMessage({ type: 'error', text: 'Link inválido. Solicite um novo link de recuperação.' })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      setLoading(false)
      return
    }

    const result = await resetPassword(token, password)

    if (result.success) {
      setSuccess(true)
      setMessage({ type: 'success', text: result.message || 'Senha redefinida com sucesso!' })
      setTimeout(() => {
        router.push('/landing/login')
      }, 3000)
    } else {
      setMessage({ type: 'error', text: result.message || 'Erro ao redefinir senha' })
    }
    setLoading(false)
  }

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
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Senha Redefinida!</h1>
                <p className="text-gray-600 mb-6">
                  Sua senha foi alterada com sucesso. Você será redirecionado para o login...
                </p>
                <Link
                  href="/landing/login"
                  className="inline-flex items-center justify-center w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all"
                >
                  Ir para Login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Senha</h1>
                <p className="text-gray-600 mb-6">
                  Digite sua nova senha abaixo.
                </p>

                {/* Message */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                      message.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {message.text}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="Repita a nova senha"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Redefinir Senha'
                    )}
                  </button>
                </form>

                <Link
                  href="/landing/login"
                  className="block text-center mt-4 text-gray-600 hover:text-[#5BB5E0] transition-colors text-sm"
                >
                  Voltar ao login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5BB5E0]/30 border-t-[#5BB5E0] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
