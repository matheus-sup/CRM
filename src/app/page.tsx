'use client'

import Link from 'next/link'
import {
  ChartBarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  CubeIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export default function HomePage() {
  const features = [
    {
      icon: UserGroupIcon,
      title: 'Gestão de Clientes',
      description: 'Cadastre e gerencie todos os seus clientes em um só lugar. Histórico completo de compras e interações.'
    },
    {
      icon: ShoppingCartIcon,
      title: 'PDV Integrado',
      description: 'Sistema de ponto de venda completo, com controle de estoque, vendas e emissão de recibos.'
    },
    {
      icon: ChartBarIcon,
      title: 'Relatórios Inteligentes',
      description: 'Dashboards com métricas em tempo real. Tome decisões baseadas em dados concretos.'
    },
    {
      icon: CubeIcon,
      title: 'Controle de Estoque',
      description: 'Gerencie produtos, categorias e movimentações. Alertas de estoque baixo automáticos.'
    },
    {
      icon: BoltIcon,
      title: 'Automações',
      description: 'Automatize tarefas repetitivas e aumente sua produtividade com fluxos inteligentes.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Loja Virtual',
      description: 'E-commerce integrado com seu estoque. Venda online 24 horas por dia.'
    }
  ]

  return (
    <div className="overflow-hidden bg-white min-h-screen">
      <LandingNavbar transparent />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#5BB5E0]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#5BB5E0]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#5BB5E0]/10 text-[#5BB5E0] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <SparklesIcon className="w-4 h-4" />
                CRM + E-commerce + PDV em uma só plataforma
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Automatize suas
                <span className="text-[#5BB5E0]"> vendas</span> e
                <span className="text-[#5BB5E0]"> cresça</span> mais
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                O sistema completo para gerenciar clientes, vendas, estoque e sua loja virtual.
                Tudo integrado, tudo simples, tudo no seu controle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/landing/login?register=true"
                  className="inline-flex items-center justify-center gap-2 bg-[#5BB5E0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#4AA5D0] transition-all hover:shadow-xl hover:shadow-[#5BB5E0]/25 hover:-translate-y-0.5"
                >
                  Começar Grátis
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/landing/recursos"
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all"
                >
                  Ver Recursos
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  <span>7 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#5BB5E0]/20 rounded-xl p-4">
                      <p className="text-[#5BB5E0] text-sm font-medium mb-1">Vendas Hoje</p>
                      <p className="text-white text-2xl font-bold">R$ 4.580</p>
                      <p className="text-green-400 text-xs">+23% vs ontem</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm font-medium mb-1">Novos Clientes</p>
                      <p className="text-white text-2xl font-bold">47</p>
                      <p className="text-green-400 text-xs">+12% esta semana</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-gray-400 text-sm font-medium mb-3">Vendas da Semana</p>
                    <div className="flex items-end gap-2 h-20">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#5BB5E0] rounded-t"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Seg</span>
                      <span>Ter</span>
                      <span>Qua</span>
                      <span>Qui</span>
                      <span>Sex</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-500/20 text-green-400 rounded-lg p-3 text-center">
                      <p className="text-xs font-medium">Pedidos</p>
                      <p className="text-lg font-bold">128</p>
                    </div>
                    <div className="flex-1 bg-purple-500/20 text-purple-400 rounded-lg p-3 text-center">
                      <p className="text-xs font-medium">Produtos</p>
                      <p className="text-lg font-bold">854</p>
                    </div>
                    <div className="flex-1 bg-yellow-500/20 text-yellow-400 rounded-lg p-3 text-center">
                      <p className="text-xs font-medium">Ticket Médio</p>
                      <p className="text-lg font-bold">R$ 89</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-4 animate-bounce hidden lg:block" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Nova venda!</p>
                    <p className="text-xs text-gray-500">R$ 289,00</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-xl p-4 animate-bounce hidden lg:block" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5BB5E0]/20 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-[#5BB5E0]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Novo cliente</p>
                    <p className="text-xs text-gray-500">João Silva</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Tudo que você precisa para
              <span className="text-[#5BB5E0]"> vender mais</span>
            </h2>
            <p className="text-xl text-gray-600">
              Uma plataforma completa com todas as ferramentas para gerenciar seu negócio de ponta a ponta.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#5BB5E0]/30 hover:shadow-xl hover:shadow-[#5BB5E0]/5 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#5BB5E0]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5BB5E0] group-hover:scale-110 transition-all">
                  <feature.icon className="w-7 h-7 text-[#5BB5E0] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/landing/recursos"
              className="inline-flex items-center gap-2 text-[#5BB5E0] font-semibold hover:underline"
            >
              Ver todos os recursos
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10.000+', label: 'Clientes Ativos' },
              { value: 'R$ 50M+', label: 'Em Vendas Processadas' },
              { value: '99.9%', label: 'Uptime Garantido' },
              { value: '4.9/5', label: 'Avaliação dos Usuários' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl lg:text-5xl font-black text-[#5BB5E0] mb-2">{stat.value}</p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-[#5BB5E0] to-[#4AA5D0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Comece agora mesmo e veja resultados em poucos dias.
            Sem complicação, sem pegadinhas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/landing/login?register=true"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5BB5E0] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Começar Grátis por 7 Dias
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-white/80 text-sm">
            Cancele quando quiser.
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
