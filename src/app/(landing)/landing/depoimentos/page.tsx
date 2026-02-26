'use client'

import Link from 'next/link'
import {
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  PlayIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export default function DepoimentosPage() {
  const featuredTestimonials = [
    {
      name: 'Maria Silva',
      role: 'Dona da Boutique Elegance',
      company: 'Boutique Elegance',
      image: null,
      content: 'O NA Automation transformou completamente meu negócio. Antes eu perdia horas com planilhas e controles manuais, agora tenho tudo na palma da mão. O PDV é super intuitivo e os relatórios me ajudam a tomar decisões mais inteligentes. Recomendo para qualquer pessoa que quer profissionalizar sua loja!',
      rating: 5,
      metrics: { revenue: '+45%', time: '-60%', clients: '+120' },
    },
    {
      name: 'Carlos Santos',
      role: 'Gerente',
      company: 'Tech Store',
      image: null,
      content: 'Aumentamos nossas vendas em 40% depois que começamos a usar o CRM. Os relatórios são incríveis e nos ajudam a identificar oportunidades que antes passavam despercebidas. O suporte também é excelente - sempre que tive dúvidas, fui atendido rapidamente.',
      rating: 5,
      metrics: { revenue: '+40%', time: '-50%', clients: '+85' },
    },
    {
      name: 'Ana Oliveira',
      role: 'CEO',
      company: 'Cosméticos Plus',
      image: null,
      content: 'A loja virtual integrada foi um divisor de águas. Agora vendo 24h por dia sem esforço adicional. O estoque sincroniza automaticamente entre a loja física e online, e isso eliminou completamente os erros de disponibilidade que tínhamos antes.',
      rating: 5,
      metrics: { revenue: '+65%', time: '-70%', clients: '+200' },
    },
  ]

  const moreTestimonials = [
    {
      name: 'Roberto Mendes',
      role: 'Proprietário',
      company: 'Empório Natural',
      content: 'Migrei de um sistema antigo e complicado para o NA Automation. A diferença é gritante! Interface limpa, funcionalidades que realmente uso e um preço justo.',
      rating: 5,
    },
    {
      name: 'Juliana Costa',
      role: 'Gerente de Vendas',
      company: 'Fashion World',
      content: 'A automação de follow-up mudou nosso jogo. Nunca mais esquecemos de um cliente e nossa taxa de recompra aumentou significativamente.',
      rating: 5,
    },
    {
      name: 'Fernando Almeida',
      role: 'Sócio',
      company: 'Casa do Vinho',
      content: 'O controle de estoque é perfeito. Alertas automáticos quando um produto está acabando, histórico de movimentações... Tudo que eu precisava.',
      rating: 5,
    },
    {
      name: 'Patrícia Lima',
      role: 'Fundadora',
      company: 'Pet Shop Amor Animal',
      content: 'Adoro a facilidade de usar! Em menos de uma hora já estava operando. O treinamento da equipe foi super rápido.',
      rating: 5,
    },
    {
      name: 'Marcos Ribeiro',
      role: 'Diretor',
      company: 'Eletrônicos Brasil',
      content: 'Temos 3 lojas e o NA Automation centraliza tudo. Consigo acompanhar o desempenho de cada unidade em tempo real.',
      rating: 5,
    },
    {
      name: 'Camila Ferreira',
      role: 'Proprietária',
      company: 'Joias & Acessórios',
      content: 'A integração com formas de pagamento é excelente. PIX, cartão, boleto... Tudo funcionando perfeitamente.',
      rating: 5,
    },
  ]

  const videoTestimonials = [
    {
      name: 'Pedro Cardoso',
      role: 'Fundador',
      company: 'Supermercado Cardoso',
      thumbnail: null,
    },
    {
      name: 'Luciana Martins',
      role: 'CEO',
      company: 'Loja de Brinquedos',
      thumbnail: null,
    },
    {
      name: 'André Silva',
      role: 'Proprietário',
      company: 'Auto Peças Silva',
      thumbnail: null,
    },
  ]

  const stats = [
    { label: 'Clientes Satisfeitos', value: '10.000+' },
    { label: 'Avaliação Média', value: '4.9/5' },
    { label: 'Taxa de Renovação', value: '96%' },
    { label: 'Recomendariam', value: '98%' },
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
              <StarIcon className="w-4 h-4" />
              Depoimentos
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              O que nossos clientes
              <span className="text-[#5BB5E0]"> dizem</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Mais de 10.000 empresas confiam no NA Automation para gerenciar seus negócios.
              Veja o que elas têm a dizer.
            </p>

            {/* Rating */}
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <span className="font-bold text-gray-900">4.9/5</span>
              <span className="text-gray-500">de 2.500+ avaliações</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-black text-[#5BB5E0] mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Histórias de Sucesso</h2>
            <p className="text-gray-600">Conheça quem transformou seu negócio com o NA Automation</p>
          </div>

          <div className="space-y-12">
            {featuredTestimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <StarSolid key={j} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#5BB5E0]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#5BB5E0] font-bold text-xl">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role} - {testimonial.company}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <ChartBarIcon className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-600">{testimonial.metrics.revenue}</p>
                      <p className="text-xs text-gray-500">Faturamento</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <SparklesIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-blue-600">{testimonial.metrics.time}</p>
                      <p className="text-xs text-gray-500">Tempo Operacional</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <UserGroupIcon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-purple-600">{testimonial.metrics.clients}</p>
                      <p className="text-xs text-gray-500">Novos Clientes</p>
                    </div>
                  </div>
                </div>

                <div className={`relative ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <ShoppingCartIcon className="w-8 h-8 text-[#5BB5E0]" />
                      </div>
                      <p className="text-gray-500 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Depoimentos em Vídeo</h2>
            <p className="text-gray-600">Assista nossos clientes contando suas experiências</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {videoTestimonials.map((video, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative bg-gray-200 rounded-2xl aspect-video mb-4 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayIcon className="w-8 h-8 text-[#5BB5E0] ml-1" />
                    </div>
                  </div>
                </div>
                <p className="font-bold text-gray-900">{video.name}</p>
                <p className="text-sm text-gray-500">{video.role} - {video.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Testimonials Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Mais Avaliações</h2>
            <p className="text-gray-600">Veja o que mais empresas estão dizendo</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreTestimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <StarSolid key={j} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5BB5E0]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#5BB5E0] font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role} - {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5BB5E0] to-[#4AA5D0]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Seja o próximo caso de sucesso
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a mais de 10.000 empresas que já transformaram seus negócios.
          </p>
          <Link
            href="/landing/login?register=true"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#5BB5E0] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all"
          >
            Começar Grátis
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
