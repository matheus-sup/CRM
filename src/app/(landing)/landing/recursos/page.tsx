'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserGroupIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CubeIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ArrowRightIcon,
  CalculatorIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  CogIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export default function RecursosPage() {
  // ROI Calculator state
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000)
  const [hoursManual, setHoursManual] = useState(40)
  const [employeeCost, setEmployeeCost] = useState(3000)

  // Calculate ROI
  const hourlyRate = employeeCost / 160 // Assuming 160 hours/month
  const timeSaved = hoursManual * 0.6 // 60% time savings
  const monthlySavings = timeSaved * hourlyRate
  const revenueIncrease = monthlyRevenue * 0.15 // 15% revenue increase
  const totalBenefit = monthlySavings + revenueIncrease
  const crmCost = 197 // Professional plan
  const roi = ((totalBenefit - crmCost) / crmCost) * 100

  const mainFeatures = [
    {
      icon: UserGroupIcon,
      title: 'Gestão de Clientes',
      description: 'Central completa de clientes com histórico de compras, interações, preferências e dados de contato. Segmente sua base e crie campanhas personalizadas.',
      benefits: [
        'Cadastro completo de clientes',
        'Histórico de compras detalhado',
        'Tags e segmentação',
        'Notas e acompanhamento',
      ]
    },
    {
      icon: ShoppingCartIcon,
      title: 'PDV Completo',
      description: 'Ponto de venda profissional com controle de estoque integrado, múltiplas formas de pagamento e emissão de recibos.',
      benefits: [
        'Interface touch-friendly',
        'Múltiplas formas de pagamento',
        'Controle de caixa',
        'Emissão de recibos',
      ]
    },
    {
      icon: ChartBarIcon,
      title: 'Relatórios Inteligentes',
      description: 'Dashboards com métricas em tempo real. Visualize vendas, produtos mais vendidos, ticket médio e muito mais.',
      benefits: [
        'Dashboard em tempo real',
        'Gráficos interativos',
        'Exportação de dados',
        'Metas e comparativos',
      ]
    },
    {
      icon: CubeIcon,
      title: 'Controle de Estoque',
      description: 'Gestão completa de produtos com alertas de estoque baixo, histórico de movimentações e controle de fornecedores.',
      benefits: [
        'Alertas automáticos',
        'Histórico de movimentações',
        'Múltiplos armazéns',
        'Código de barras',
      ]
    },
    {
      icon: BoltIcon,
      title: 'Automações',
      description: 'Automatize tarefas repetitivas como follow-ups, lembretes de aniversário, alertas de recompra e muito mais.',
      benefits: [
        'Emails automáticos',
        'Lembretes personalizados',
        'Fluxos de nutrição',
        'Integrações',
      ]
    },
    {
      icon: GlobeAltIcon,
      title: 'Loja Virtual',
      description: 'E-commerce integrado com seu estoque. Design responsivo, checkout otimizado e diversas formas de pagamento.',
      benefits: [
        'Design responsivo',
        'Checkout otimizado',
        'SEO integrado',
        'Cupons e promoções',
      ]
    },
  ]

  const additionalFeatures = [
    { icon: DevicePhoneMobileIcon, title: 'Acesso Mobile', description: 'Acesse de qualquer dispositivo' },
    { icon: ShieldCheckIcon, title: 'Segurança', description: 'Dados criptografados e seguros' },
    { icon: CloudArrowUpIcon, title: 'Backup Automático', description: 'Nunca perca seus dados' },
    { icon: CogIcon, title: 'API Completa', description: 'Integre com outros sistemas' },
    { icon: DocumentChartBarIcon, title: 'Exportação', description: 'Exporte para Excel/PDF' },
    { icon: ChartPieIcon, title: 'Analytics', description: 'Análises detalhadas' },
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
              Recursos Completos
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Tudo que você precisa em
              <span className="text-[#5BB5E0]"> um só lugar</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Conheça todas as ferramentas que vão transformar a gestão do seu negócio.
              Do PDV ao e-commerce, passando por relatórios e automações.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/landing/login?register=true"
                className="inline-flex items-center justify-center gap-2 bg-[#5BB5E0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#4AA5D0] transition-all hover:shadow-xl hover:shadow-[#5BB5E0]/25"
              >
                Testar Grátis
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calcular ROI
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {mainFeatures.map((feature, i) => (
              <div
                key={i}
                className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-16 h-16 bg-[#5BB5E0] rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-[#5BB5E0] flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#5BB5E0]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <PlayIcon className="w-8 h-8 text-[#5BB5E0]" />
                        </div>
                        <p className="text-gray-400 text-sm">{feature.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">E muito mais...</h2>
            <p className="text-gray-600">Recursos adicionais para potencializar seu negócio</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {additionalFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#5BB5E0]/30 hover:shadow-lg transition-all text-center"
              >
                <div className="w-12 h-12 bg-[#5BB5E0]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-[#5BB5E0]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="py-20 bg-gradient-to-br from-[#5BB5E0] to-[#4AA5D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <CalculatorIcon className="w-4 h-4" />
              Calculadora Interativa
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Calcule seu Retorno sobre Investimento
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Descubra quanto você pode economizar e ganhar com o NA Automation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Inputs */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Seus Dados</h3>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-[#5BB5E0]" />
                      Faturamento Mensal
                    </span>
                    <span className="text-[#5BB5E0] font-bold">
                      R$ {monthlyRevenue.toLocaleString('pt-BR')}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5BB5E0]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>R$ 10k</span>
                    <span>R$ 500k</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-[#5BB5E0]" />
                      Horas em tarefas manuais/mês
                    </span>
                    <span className="text-[#5BB5E0] font-bold">{hoursManual}h</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="160"
                    step="5"
                    value={hoursManual}
                    onChange={(e) => setHoursManual(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5BB5E0]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10h</span>
                    <span>160h</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4 text-[#5BB5E0]" />
                      Custo médio funcionário/mês
                    </span>
                    <span className="text-[#5BB5E0] font-bold">
                      R$ {employeeCost.toLocaleString('pt-BR')}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1500"
                    max="10000"
                    step="500"
                    value={employeeCost}
                    onChange={(e) => setEmployeeCost(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5BB5E0]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>R$ 1.5k</span>
                    <span>R$ 10k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Seu Resultado</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-gray-700">Economia com tempo</span>
                  <span className="text-green-600 font-bold text-lg">
                    + R$ {monthlySavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-gray-700">Aumento nas vendas (~15%)</span>
                  <span className="text-blue-600 font-bold text-lg">
                    + R$ {revenueIncrease.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Investimento (Plano Professional)</span>
                  <span className="text-gray-600 font-bold text-lg">
                    - R$ {crmCost}/mês
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Benefício Total</span>
                  <span className="text-2xl font-black text-[#5BB5E0]">
                    R$ {(totalBenefit - crmCost).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês
                  </span>
                </div>
                <div className="bg-[#5BB5E0]/10 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Retorno sobre Investimento</p>
                  <p className="text-4xl font-black text-[#5BB5E0]">
                    {roi.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
                  </p>
                </div>
              </div>

              <Link
                href="/landing/login?register=true"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#5BB5E0] text-white py-4 rounded-xl font-bold hover:bg-[#4AA5D0] transition-all"
              >
                Começar Agora
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Teste gratuitamente por 7 dias.
          </p>
          <Link
            href="/landing/login?register=true"
            className="inline-flex items-center justify-center gap-2 bg-[#5BB5E0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#4AA5D0] transition-all hover:shadow-xl hover:shadow-[#5BB5E0]/25"
          >
            Criar Conta Grátis
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
