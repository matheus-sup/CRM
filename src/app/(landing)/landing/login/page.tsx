'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'
import {
  registerCrmUser,
  loginCrmUser,
  requestPasswordReset,
  resendVerificationEmail,
} from '@/lib/actions/landing-auth'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRegister, setIsRegister] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegister(true)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginCrmUser(formData)

    if (result.success) {
      router.push(result.redirectTo || '/admin')
    } else {
      if (result.requiresVerification) {
        setNeedsVerification(true)
        setVerificationEmail(result.email || formData.get('email') as string)
      }
      setMessage({ type: 'error', text: result.message || 'Erro ao fazer login' })
    }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const result = await registerCrmUser(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Conta criada com sucesso!' })
      if (result.requiresVerification) {
        setNeedsVerification(true)
        setVerificationEmail(formData.get('email') as string)
      }
    } else {
      // Check if requires subscription - redirect to checkout
      if ((result as any).requiresSubscription) {
        router.push((result as any).redirectTo || '/landing/checkout')
        return
      }
      setMessage({ type: 'error', text: result.message || 'Erro ao criar conta' })
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const result = await requestPasswordReset(email)

    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message || 'Erro ao solicitar recuperação',
    })
    setLoading(false)
  }

  const handleResendVerification = async () => {
    if (!verificationEmail) return
    setLoading(true)
    const result = await resendVerificationEmail(verificationEmail)
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message || 'Erro ao reenviar email',
    })
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
            {/* Verification Notice */}
            {needsVerification && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Verificação Pendente</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Enviamos um email para <strong>{verificationEmail}</strong>. Verifique sua caixa de entrada.
                    </p>
                    <button
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="text-xs text-[#5BB5E0] hover:underline mt-2"
                    >
                      Reenviar email de verificação
                    </button>
                  </div>
                </div>
              </div>
            )}

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

            {/* Forgot Password Form */}
            {isForgotPassword ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
                <p className="text-gray-600 mb-6">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Enviar Link
                        <ArrowRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full mt-4 text-gray-600 hover:text-[#5BB5E0] transition-colors text-sm"
                >
                  Voltar ao login
                </button>
              </>
            ) : isRegister ? (
              /* Register Form */
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h1>
                <p className="text-gray-600 mb-6">
                  Complete seu cadastro para acessar sua conta
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="company"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ *</label>
                    <div className="relative">
                      <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="document"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="Repita a senha"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Criar Conta
                        <ArrowRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-gray-600 mt-6 text-sm">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-[#5BB5E0] hover:underline font-medium"
                  >
                    Fazer login
                  </button>
                </p>
              </>
            ) : (
              /* Login Form */
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Entrar</h1>
                <p className="text-gray-600 mb-6">
                  Acesse sua conta NA Automation
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5BB5E0] focus:border-transparent transition-all"
                        placeholder="Sua senha"
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#5BB5E0] focus:ring-[#5BB5E0]" />
                      <span className="text-sm text-gray-600">Lembrar de mim</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-[#5BB5E0] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5BB5E0] text-white py-3 rounded-xl font-semibold hover:bg-[#4AA5D0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Entrar
                        <ArrowRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <p className="text-center text-gray-600 text-sm">
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="text-[#5BB5E0] hover:underline font-medium"
                  >
                    Criar conta grátis
                  </button>
                </p>
              </>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 bg-[#5BB5E0]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircleIcon className="w-5 h-5 text-[#5BB5E0]" />
              </div>
              <p className="text-xs text-gray-600">Pagamento seguro</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-[#5BB5E0]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircleIcon className="w-5 h-5 text-[#5BB5E0]" />
              </div>
              <p className="text-xs text-gray-600">Suporte dedicado</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-[#5BB5E0]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircleIcon className="w-5 h-5 text-[#5BB5E0]" />
              </div>
              <p className="text-xs text-gray-600">Cancele quando quiser</p>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5BB5E0]/30 border-t-[#5BB5E0] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
