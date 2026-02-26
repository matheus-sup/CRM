"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface SellerSales {
  id: string
  name: string
  total: number
}

interface SellersCardProps {
  sellers: SellerSales[]
}

export function SellersCard({ sellers }: SellersCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Visão Vendedores</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {sellers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhum vendedor ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {sellers.map((seller, index) => (
              <div
                key={seller.id}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-medium">{seller.name}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(seller.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
