// ===== Solar Energy Calculators =====

export const SOLAR_CONSTANTS = {
  TARIFA: 0.90,           // R$/kWh
  GERACAO_POR_KWP: 101,   // kWh gerado por kWp por mês (Piracicaba-SP, 31% perdas)
  PRECO_POR_KWP: 2484,    // R$ por kWp instalado
  POTENCIA_PLACA: 580,    // Watts por placa
  TAXA_MINIMA: 50         // kWh taxa mínima (bifásico)
}

export interface EconomiaResult {
  gastoAtualMensal: number
  economiaMensal: number
  economia1ano: number
  economia5anos: number
  economia10anos: number
  economia25anos: number
}

export interface SistemaResult {
  potenciaKwp: number
  numeroPaineis: number
  areaNecessariaM2: number
}

export interface ROIResult {
  custoEstimado: number
  tempoRetornoMeses: number
  tempoRetornoAnos: number
  lucro25anos: number
  roi25anos: number
}

// Calcular gasto mensal atual
export function calcularGastoMensal(consumoKwh: number, tarifaKwh: number = SOLAR_CONSTANTS.TARIFA): number {
  return consumoKwh * tarifaKwh
}

// Calcular economia com energia solar
export function calcularEconomia(consumoKwh: number, tarifaKwh: number = SOLAR_CONSTANTS.TARIFA): EconomiaResult {
  const gastoMensal = calcularGastoMensal(consumoKwh, tarifaKwh)
  // Economia considera o abatimento do consumo, mantendo apenas taxa mínima
  const consumoAbatido = Math.max(0, consumoKwh - SOLAR_CONSTANTS.TAXA_MINIMA)
  const economiaMensal = consumoAbatido * tarifaKwh

  return {
    gastoAtualMensal: gastoMensal,
    economiaMensal: economiaMensal,
    economia1ano: economiaMensal * 12,
    economia5anos: economiaMensal * 60,
    economia10anos: economiaMensal * 120,
    economia25anos: economiaMensal * 300
  }
}

// Dimensionar sistema solar necessário
export function dimensionarSistema(consumoKwh: number, potenciaPlaca: number = SOLAR_CONSTANTS.POTENCIA_PLACA): SistemaResult {
  // Potência necessária baseada na geração média
  const potenciaNecessaria = consumoKwh / SOLAR_CONSTANTS.GERACAO_POR_KWP

  // Quantidade de placas (arredonda para cima)
  const potenciaNecessariaW = potenciaNecessaria * 1000
  const numeroPaineis = Math.ceil(potenciaNecessariaW / potenciaPlaca)

  // Potência real instalada
  const potenciaRealKwp = (numeroPaineis * potenciaPlaca) / 1000
  const potenciaArredondada = Math.ceil(potenciaRealKwp * 100) / 100

  // Estimar área necessária (aprox. 2.5m² por painel de alta potência)
  const areaNecessaria = numeroPaineis * 2.5

  return {
    potenciaKwp: potenciaArredondada,
    numeroPaineis: numeroPaineis,
    areaNecessariaM2: areaNecessaria
  }
}

// Obter preço por placa baseado na quantidade (preços escalonados)
export function getPrecoPlaca(numeroPaineis: number): number {
  if (numeroPaineis > 19) {
    return 1232.50  // Acima de 19 placas
  } else if (numeroPaineis > 13) {
    return 1232.50  // Acima de 13 placas (14-19)
  } else if (numeroPaineis > 9) {
    return 1300.00  // Acima de 9 placas (10-13)
  } else if (numeroPaineis > 5) {
    return 1550.00  // Acima de 5 placas (6-9)
  } else {
    // 5 placas ou menos
    return 1900.00
  }
}

// Calcular ROI (retorno sobre investimento)
export function calcularROI(consumoKwh: number, tarifaKwh: number = SOLAR_CONSTANTS.TARIFA, potenciaPlaca: number = SOLAR_CONSTANTS.POTENCIA_PLACA): ROIResult {
  const economia = calcularEconomia(consumoKwh, tarifaKwh)
  const sistema = dimensionarSistema(consumoKwh, potenciaPlaca)

  // Custo do sistema baseado no preço por placa (escalonado por quantidade)
  const precoPlaca = getPrecoPlaca(sistema.numeroPaineis)
  const custoSistema = sistema.numeroPaineis * precoPlaca

  // Tempo de retorno em meses
  const tempoRetornoMeses = custoSistema / economia.economiaMensal
  const tempoRetornoAnos = Math.ceil(tempoRetornoMeses / 12 * 10) / 10

  // ROI após 25 anos
  const economiaTotal25anos = economia.economia25anos
  const lucro25anos = economiaTotal25anos - custoSistema
  const roi25anos = (lucro25anos / custoSistema) * 100

  return {
    custoEstimado: custoSistema,
    tempoRetornoMeses: Math.ceil(tempoRetornoMeses),
    tempoRetornoAnos: tempoRetornoAnos,
    lucro25anos: lucro25anos,
    roi25anos: Math.round(roi25anos)
  }
}

// Formatar valor para moeda brasileira
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

// Formatar número com separador de milhar
export function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR')
}
