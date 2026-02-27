'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  calcularGastoMensal,
  calcularEconomia,
  dimensionarSistema,
  calcularROI,
  formatarMoeda,
  SOLAR_CONSTANTS,
  type EconomiaResult,
  type SistemaResult,
  type ROIResult
} from '@/lib/solar-calculators'
import { BarChart3, Coins, Sun, TrendingUp, Calculator, Zap, PanelTop, AreaChart } from 'lucide-react'

// Calculadora de Consumo
export function CalculadoraConsumo() {
  const [consumo, setConsumo] = useState('')
  const [tarifa, setTarifa] = useState('')
  const [resultado, setResultado] = useState<{ mensal: number; anual: number } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const consumoNum = parseFloat(consumo)
    const tarifaNum = parseFloat(tarifa) || SOLAR_CONSTANTS.TARIFA

    const gasto = calcularGastoMensal(consumoNum, tarifaNum)
    setResultado({
      mensal: gasto,
      anual: gasto * 12
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Calculadora de Consumo</CardTitle>
            <CardDescription>Descubra quanto você gasta com energia</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumo-kwh">Consumo Mensal (kWh)</Label>
            <Input
              id="consumo-kwh"
              type="number"
              placeholder="Ex: 300"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tarifa-kwh">Tarifa (R$/kWh) - Opcional</Label>
            <Input
              id="tarifa-kwh"
              type="number"
              placeholder={`Padrão: ${SOLAR_CONSTANTS.TARIFA}`}
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full">
            <Calculator className="w-4 h-4 mr-2" />
            Calcular
          </Button>
        </form>

        {resultado && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Gasto Mensal</p>
              <p className="text-xl font-bold text-blue-600">{formatarMoeda(resultado.mensal)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Gasto Anual</p>
              <p className="text-xl font-bold text-gray-900">{formatarMoeda(resultado.anual)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Calculadora de Economia
export function CalculadoraEconomia() {
  const [consumo, setConsumo] = useState('')
  const [tarifa, setTarifa] = useState('')
  const [resultado, setResultado] = useState<EconomiaResult | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const consumoNum = parseFloat(consumo)
    const tarifaNum = parseFloat(tarifa) || SOLAR_CONSTANTS.TARIFA

    const economia = calcularEconomia(consumoNum, tarifaNum)
    setResultado(economia)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Coins className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Simulador de Economia</CardTitle>
            <CardDescription>Veja quanto você pode economizar</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumo-economia">Consumo Mensal (kWh)</Label>
            <Input
              id="consumo-economia"
              type="number"
              placeholder="Ex: 300"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tarifa-economia">Tarifa (R$/kWh) - Opcional</Label>
            <Input
              id="tarifa-economia"
              type="number"
              placeholder={`Padrão: ${SOLAR_CONSTANTS.TARIFA}`}
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            <Zap className="w-4 h-4 mr-2" />
            Simular
          </Button>
        </form>

        {resultado && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Economia Mensal</p>
              <p className="text-xl font-bold text-green-600">{formatarMoeda(resultado.economiaMensal)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Economia em 1 Ano</p>
              <p className="text-xl font-bold text-gray-900">{formatarMoeda(resultado.economia1ano)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Economia em 5 Anos</p>
              <p className="text-xl font-bold text-gray-900">{formatarMoeda(resultado.economia5anos)}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Economia em 25 Anos</p>
              <p className="text-xl font-bold text-amber-600">{formatarMoeda(resultado.economia25anos)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Calculadora de Dimensionamento
export function CalculadoraDimensionamento() {
  const [consumo, setConsumo] = useState('')
  const [resultado, setResultado] = useState<SistemaResult | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const consumoNum = parseFloat(consumo)

    const sistema = dimensionarSistema(consumoNum)
    setResultado(sistema)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sun className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <CardTitle>Dimensionador de Sistema</CardTitle>
            <CardDescription>Saiba o tamanho ideal do seu sistema</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumo-dimensionar">Consumo Mensal (kWh)</Label>
            <Input
              id="consumo-dimensionar"
              type="number"
              placeholder="Ex: 300"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
              min="1"
            />
          </div>
          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
            <PanelTop className="w-4 h-4 mr-2" />
            Dimensionar
          </Button>
        </form>

        {resultado && (
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Potência Necessária</p>
              <p className="text-2xl font-bold text-amber-600">{resultado.potenciaKwp} kWp</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Painéis</p>
                <p className="text-xl font-bold text-gray-900">{resultado.numeroPaineis}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Área Necessária</p>
                <p className="text-xl font-bold text-gray-900">{resultado.areaNecessariaM2} m²</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Calculadora de ROI
export function CalculadoraROI() {
  const [consumo, setConsumo] = useState('')
  const [tarifa, setTarifa] = useState('')
  const [resultado, setResultado] = useState<ROIResult | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const consumoNum = parseFloat(consumo)
    const tarifaNum = parseFloat(tarifa) || SOLAR_CONSTANTS.TARIFA

    const roi = calcularROI(consumoNum, tarifaNum)
    setResultado(roi)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle>Calculadora de ROI</CardTitle>
            <CardDescription>Tempo de retorno do investimento</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumo-roi">Consumo Mensal (kWh)</Label>
            <Input
              id="consumo-roi"
              type="number"
              placeholder="Ex: 300"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tarifa-roi">Tarifa (R$/kWh) - Opcional</Label>
            <Input
              id="tarifa-roi"
              type="number"
              placeholder={`Padrão: ${SOLAR_CONSTANTS.TARIFA}`}
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            <AreaChart className="w-4 h-4 mr-2" />
            Calcular ROI
          </Button>
        </form>

        {resultado && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Investimento</p>
              <p className="text-xl font-bold text-gray-900">{formatarMoeda(resultado.custoEstimado)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Tempo de Retorno</p>
              <p className="text-xl font-bold text-purple-600">{resultado.tempoRetornoAnos} anos</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Lucro em 25 Anos</p>
              <p className="text-xl font-bold text-green-600">{formatarMoeda(resultado.lucro25anos)}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">ROI em 25 Anos</p>
              <p className="text-xl font-bold text-amber-600">{resultado.roi25anos}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente principal com todas as calculadoras
export function SolarCalculatorsGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <CalculadoraConsumo />
      <CalculadoraEconomia />
      <CalculadoraDimensionamento />
      <CalculadoraROI />
    </div>
  )
}
