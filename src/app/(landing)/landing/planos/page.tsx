'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export default function PlanosPage() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal para pequenos negócios que estão começando',
      monthlyPrice: 97,
      annualPrice: 77,
      features: [
        { name: 'Até 500 clientes', included: true },
        { name: 'PDV básico', included: true },
        { name: '1 usuário', included: true },
        { name: 'Gestão de Estoque', included: true },
        { name: 'Pagamentos Online', included: true },
        { name: 'Acesso a Loja de Ferramentas', included: true },
        { name: 'Loja virtual', included: true },
        { name: 'Relatórios essenciais', included: true },
        { name: 'Suporte por email', included: true },
      ],
      highlighted: false,
      cta: 'Começar Grátis',
    },
    {
      name: 'Professional',
      description: 'Para negócios em crescimento que precisam de mais recursos',
      monthlyPrice: 197,
      annualPrice: 157,
      includesFrom: 'Tudo do plano Starter +',
      features: [
        { name: 'Acesso a todas as Ferramentas da Loja', included: true },
        { name: 'Até 5.000 clientes', included: true },
        { name: 'PDV completo', included: true },
        { name: '5 usuários', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'Automações básicas', included: true },
      ],
      highlighted: true,
      cta: 'Começar Grátis',
    },
    {
      name: 'Enterprise',
      description: 'Para operações robustas que exigem o máximo',
      monthlyPrice: 397,
      annualPrice: 317,
      includesFrom: 'Tudo do plano Professional +',
      features: [
        { name: 'Clientes ilimitados', included: true },
        { name: 'PDV multi-lojas', included: true },
        { name: 'Usuários ilimitados', included: true },
        { name: 'Relatórios personalizados', included: true },
        { name: 'Suporte 24/7', included: true },
        { name: 'Automações avançadas', included: true },
        { name: 'API completa', included: true },
      ],
      highlighted: false,
      cta: 'Falar com Vendas',
    },
  ]

  const faqs = [
    {
      question: 'Posso testar antes de comprar?',
      answer: 'Sim! Oferecemos 7 dias de teste gratuito em todos os planos. Você tem acesso completo a todos os recursos durante o período de teste.'
    },
    {
      question: 'Posso mudar de plano depois?',
      answer: 'Claro! Você pode fazer upgrade ou downgrade a qualquer momento. Se fizer upgrade, a diferença será calculada proporcionalmente. Se fizer downgrade, o novo valor será aplicado no próximo ciclo de cobrança.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos cartão de crédito, boleto bancário e PIX. Para planos anuais, oferecemos desconto de até 20% e você pode parcelar em até 12x.'
    },
    {
      question: 'E se eu precisar de mais usuários?',
      answer: 'No plano Professional, usuários adicionais custam R$ 29/mês cada. No plano Enterprise, você tem usuários ilimitados inclusos.'
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim! Utilizamos criptografia de ponta a ponta, backups automáticos diários e seguimos todas as práticas de segurança da LGPD. Seus dados estão armazenados em servidores brasileiros.'
    },
    {
      question: 'Vocês oferecem treinamento?',
      answer: 'Todos os planos incluem acesso à nossa base de conhecimento e tutoriais em vídeo. Planos Professional e Enterprise incluem sessões de onboarding personalizadas.'
    },
  ]

  const comparisonFeatures = [
    { name: 'Clientes', starter: '500', professional: '5.000', enterprise: 'Ilimitado' },
    { name: 'Usuários', starter: '1', professional: '5', enterprise: 'Ilimitado' },
    { name: 'PDV', starter: 'Básico', professional: 'Completo', enterprise: 'Multi-lojas' },
    { name: 'Gestão de Estoque', starter: 'Sim', professional: 'Sim', enterprise: 'Avançado' },
    { name: 'Pagamentos Online', starter: 'Sim', professional: 'Sim', enterprise: 'Sim' },
    { name: 'Loja de Ferramentas', starter: 'Acesso', professional: 'Todas', enterprise: 'Todas' },
    { name: 'Relatórios', starter: 'Essenciais', professional: 'Avançados', enterprise: 'Personalizados' },
    { name: 'Loja Virtual', starter: 'Sim', professional: 'Sim', enterprise: 'Sim' },
    { name: 'Automações', starter: '-', professional: 'Básicas', enterprise: 'Avançadas' },
    { name: 'API', starter: '-', professional: '-', enterprise: 'Completa' },
    { name: 'Suporte', starter: 'Email', professional: 'Prioritário', enterprise: '24/7' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#5BB5E0]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#5BB5E0]/10 text-[#5BB5E0] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <SparklesIcon className="w-4 h-4" />
              Planos e Preços
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Escolha o plano ideal para seu
              <span className="text-[#5BB5E0]"> negócio</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Todos os planos incluem 7 dias de teste gratuito.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-4 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  !isAnnual ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  isAnnual ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Anual
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-[#5BB5E0] text-white scale-105 shadow-2xl shadow-[#5BB5E0]/25'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    Mais Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>R$</span>
                    <span className={`text-5xl font-black ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>/mês</span>
                  </div>
                  {isAnnual && (
                    <p className={`text-xs mt-2 ${plan.highlighted ? 'text-white/60' : 'text-gray-400'}`}>
                      cobrado anualmente (R$ {(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12}/ano)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.includesFrom && (
                    <li className={`font-semibold pb-2 border-b ${plan.highlighted ? 'text-white border-white/20' : 'text-[#5BB5E0] border-gray-200'}`}>
                      {plan.includesFrom}
                    </li>
                  )}
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckIcon className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-[#5BB5E0]'}`} />
                      ) : (
                        <XMarkIcon className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-white/40' : 'text-gray-300'}`} />
                      )}
                      <span className={
                        feature.included
                          ? plan.highlighted ? 'text-white/90' : 'text-gray-600'
                          : plan.highlighted ? 'text-white/40' : 'text-gray-400'
                      }>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === 'Enterprise' ? '#contact' : '/landing/login?register=true'}
                  className={`w-full py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-white text-[#5BB5E0] hover:bg-gray-100'
                      : 'bg-[#5BB5E0] text-white hover:bg-[#4AA5D0]'
                  }`}
                >
                  {plan.cta}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Compare os planos</h2>
            <p className="text-gray-600">Veja todas as diferenças entre os planos</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-500">Recursos</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-4 font-bold text-[#5BB5E0]">Professional</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">{feature.name}</td>
                    <td className="text-center py-4 px-4 text-gray-600">{feature.starter}</td>
                    <td className="text-center py-4 px-4 text-[#5BB5E0] font-medium">{feature.professional}</td>
                    <td className="text-center py-4 px-4 text-gray-600">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#5BB5E0]/10 text-[#5BB5E0] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <QuestionMarkCircleIcon className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-[#5BB5E0] group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5BB5E0] to-[#4AA5D0]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Nossa equipe está pronta para ajudar você a escolher o melhor plano.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/landing/login?register=true"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5BB5E0] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all"
            >
              Começar Grátis
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-all"
            >
              Falar com Vendas
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
