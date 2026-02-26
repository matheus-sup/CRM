import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NA Automation - CRM Inteligente para seu Negócio',
  description: 'Automatize suas vendas, gerencie clientes e aumente sua receita com o CRM mais completo do mercado.',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
