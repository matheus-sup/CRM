"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  calcularGastoMensal,
  calcularEconomia,
  dimensionarSistema,
  calcularROI,
  SOLAR_CONSTANTS,
} from "@/lib/solar-calculators";

// ===== ORÇAMENTOS =====

export async function getOrcamentos() {
  const orcamentos = await prisma.solarOrcamento.findMany({
    include: {
      cliente: true,
      envios: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orcamentos.map((o) => ({
    ...o,
    valorConta: Number(o.valorConta),
    consumo: Number(o.consumo),
    potencia: Number(o.potencia),
    custoSistema: Number(o.custoSistema),
    economiaMensal: Number(o.economiaMensal),
    economiaAnual: Number(o.economiaAnual),
    retornoAnos: Number(o.retornoAnos),
  }));
}

export async function getOrcamento(id: number) {
  const orcamento = await prisma.solarOrcamento.findUnique({
    where: { id },
    include: {
      cliente: true,
      envios: {
        orderBy: { createdAt: "desc" },
      },
      compromissos: {
        orderBy: { data: "asc" },
      },
    },
  });

  if (!orcamento) return null;

  return {
    ...orcamento,
    valorConta: Number(orcamento.valorConta),
    consumo: Number(orcamento.consumo),
    potencia: Number(orcamento.potencia),
    custoSistema: Number(orcamento.custoSistema),
    economiaMensal: Number(orcamento.economiaMensal),
    economiaAnual: Number(orcamento.economiaAnual),
    retornoAnos: Number(orcamento.retornoAnos),
  };
}

export async function createOrcamento(data: {
  nomeCliente: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  valorConta: number;
  perdaPercentual?: number;
  potenciaPlaca?: number;
  observacoes?: string;
}) {
  // Calcular campos automaticamente
  const consumo = data.valorConta / SOLAR_CONSTANTS.TARIFA;

  // Usar potência da placa informada ou padrão
  const potenciaPlaca = data.potenciaPlaca || SOLAR_CONSTANTS.POTENCIA_PLACA;

  // Aplicar perda percentual se informada (aumenta o consumo necessário para compensar perdas)
  const perdaFator = data.perdaPercentual ? 1 + (data.perdaPercentual / 100) : 1;
  const consumoComPerda = consumo * perdaFator;

  const sistema = dimensionarSistema(consumoComPerda, potenciaPlaca);
  const economia = calcularEconomia(consumo); // Economia baseada no consumo real
  const roi = calcularROI(consumoComPerda, SOLAR_CONSTANTS.TARIFA, potenciaPlaca); // ROI baseado no sistema dimensionado com perda

  // Incluir informação de perda e potência nas observações
  let observacoesFinais = data.observacoes || '';
  const infos: string[] = [];
  if (data.potenciaPlaca && data.potenciaPlaca !== SOLAR_CONSTANTS.POTENCIA_PLACA) {
    infos.push(`Placa: ${data.potenciaPlaca}W`);
  }
  if (data.perdaPercentual) {
    infos.push(`Perda: ${data.perdaPercentual}%`);
  }
  if (infos.length > 0) {
    const infoStr = `[${infos.join(' | ')}]`;
    observacoesFinais = observacoesFinais ? `${infoStr} ${observacoesFinais}` : infoStr;
  }

  const orcamento = await prisma.solarOrcamento.create({
    data: {
      nomeCliente: data.nomeCliente,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      cidade: data.cidade,
      valorConta: data.valorConta,
      consumo: consumo,
      potencia: sistema.potenciaKwp,
      qtdPlacas: sistema.numeroPaineis,
      custoSistema: roi.custoEstimado,
      economiaMensal: economia.economiaMensal,
      economiaAnual: economia.economia1ano,
      retornoAnos: roi.tempoRetornoAnos,
      observacoes: observacoesFinais || undefined,
      status: "orcamento_gerado",
    },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { id: orcamento.id };
}

export async function updateOrcamento(
  id: number,
  data: {
    nomeCliente?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    valorConta?: number;
    consumo?: number;
    potencia?: number;
    qtdPlacas?: number;
    custoSistema?: number;
    economiaMensal?: number;
    economiaAnual?: number;
    retornoAnos?: number;
    observacoes?: string;
    potenciaPlaca?: number;
  }
) {
  // Se valorConta mudou, recalcular campos
  let updateData = { ...data };
  if (data.valorConta !== undefined) {
    const consumo = data.valorConta / SOLAR_CONSTANTS.TARIFA;
    const potenciaPlaca = data.potenciaPlaca || SOLAR_CONSTANTS.POTENCIA_PLACA;
    const sistema = dimensionarSistema(consumo, potenciaPlaca);
    const economia = calcularEconomia(consumo);
    const roi = calcularROI(consumo, SOLAR_CONSTANTS.TARIFA, potenciaPlaca);

    updateData = {
      ...updateData,
      consumo: consumo,
      potencia: sistema.potenciaKwp,
      qtdPlacas: sistema.numeroPaineis,
      custoSistema: roi.custoEstimado,
      economiaMensal: economia.economiaMensal,
      economiaAnual: economia.economia1ano,
      retornoAnos: roi.tempoRetornoAnos,
    };
  }

  await prisma.solarOrcamento.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

export async function updateOrcamentoStatus(
  id: number,
  status: string,
  observacao?: string
) {
  const orcamento = await prisma.solarOrcamento.findUnique({
    where: { id },
  });

  if (!orcamento) throw new Error("Orçamento não encontrado");

  // Adicionar ao histórico
  const historico = orcamento.historico
    ? JSON.parse(orcamento.historico)
    : [];
  historico.push({
    status,
    observacao,
    data: new Date().toISOString(),
  });

  await prisma.solarOrcamento.update({
    where: { id },
    data: {
      status,
      historico: JSON.stringify(historico),
    },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

export async function deleteOrcamento(id: number) {
  await prisma.solarOrcamento.delete({
    where: { id },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

// ===== CLIENTES =====

export async function getClientes() {
  const clientes = await prisma.solarCliente.findMany({
    include: {
      orcamentos: {
        select: {
          id: true,
          status: true,
          custoSistema: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return clientes.map((c) => ({
    ...c,
    orcamentos: c.orcamentos.map((o) => ({
      ...o,
      custoSistema: Number(o.custoSistema),
    })),
  }));
}

export async function createCliente(data: {
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  cpfCnpj?: string;
  observacoes?: string;
}) {
  const cliente = await prisma.solarCliente.create({
    data,
  });

  revalidatePath("/admin/ferramentas/solar");
  return { id: cliente.id };
}

export async function updateCliente(
  id: string,
  data: {
    nome?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    cpfCnpj?: string;
    observacoes?: string;
  }
) {
  await prisma.solarCliente.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

export async function deleteCliente(id: string) {
  await prisma.solarCliente.delete({
    where: { id },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

// ===== ESTOQUE =====

export async function getEstoque() {
  const produtos = await prisma.solarEstoque.findMany({
    include: {
      movimentacoes: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: { nome: "asc" },
  });

  return produtos.map((p) => ({
    ...p,
    valorUnitario: Number(p.valorUnitario),
  }));
}

export async function createProdutoEstoque(data: {
  nome: string;
  categoria?: string;
  unidade?: string;
  quantidade?: number;
  valorUnitario?: number;
  estoqueMinimo?: number;
}) {
  const produto = await prisma.solarEstoque.create({
    data: {
      nome: data.nome,
      categoria: data.categoria || "outros",
      unidade: data.unidade || "un",
      quantidade: data.quantidade || 0,
      valorUnitario: data.valorUnitario || 0,
      estoqueMinimo: data.estoqueMinimo || 0,
    },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { id: produto.id };
}

export async function updateProdutoEstoque(
  id: string,
  data: {
    nome?: string;
    categoria?: string;
    unidade?: string;
    quantidade?: number;
    valorUnitario?: number;
    estoqueMinimo?: number;
  }
) {
  await prisma.solarEstoque.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

export async function deleteProdutoEstoque(id: string) {
  await prisma.solarEstoque.delete({
    where: { id },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

export async function registrarMovimentacao(
  estoqueId: string,
  data: {
    tipo: "entrada" | "saida";
    quantidade: number;
    motivo?: string;
  }
) {
  const produto = await prisma.solarEstoque.findUnique({
    where: { id: estoqueId },
  });

  if (!produto) throw new Error("Produto não encontrado");

  const novaQuantidade =
    data.tipo === "entrada"
      ? produto.quantidade + data.quantidade
      : produto.quantidade - data.quantidade;

  if (novaQuantidade < 0) throw new Error("Estoque insuficiente");

  await prisma.$transaction([
    prisma.solarMovimentacao.create({
      data: {
        estoqueId,
        tipo: data.tipo,
        quantidade: data.quantidade,
        motivo: data.motivo,
      },
    }),
    prisma.solarEstoque.update({
      where: { id: estoqueId },
      data: { quantidade: novaQuantidade },
    }),
  ]);

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

// ===== COMPROMISSOS =====

export async function getCompromissos(dataInicio?: Date, dataFim?: Date) {
  const where: any = {};
  if (dataInicio && dataFim) {
    where.data = {
      gte: dataInicio,
      lte: dataFim,
    };
  }

  const compromissos = await prisma.solarCompromisso.findMany({
    where,
    include: {
      orcamento: {
        select: {
          id: true,
          nomeCliente: true,
        },
      },
    },
    orderBy: { data: "asc" },
  });

  return compromissos;
}

export async function createCompromisso(data: {
  titulo: string;
  tipo: string;
  data: Date;
  horaInicio?: string;
  horaFim?: string;
  local?: string;
  descricao?: string;
  orcamentoId?: number;
}) {
  const compromisso = await prisma.solarCompromisso.create({
    data,
  });

  revalidatePath("/admin/ferramentas/solar");
  return { id: compromisso.id };
}

export async function updateCompromisso(
  id: string,
  data: {
    titulo?: string;
    tipo?: string;
    data?: Date;
    horaInicio?: string;
    horaFim?: string;
    local?: string;
    descricao?: string;
    concluido?: boolean;
  }
) {
  await prisma.solarCompromisso.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

export async function deleteCompromisso(id: string) {
  await prisma.solarCompromisso.delete({
    where: { id },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

// ===== CATEGORIAS =====

export async function getCategorias() {
  return prisma.solarCategoria.findMany({
    orderBy: { nome: "asc" },
  });
}

export async function createCategoria(nome: string) {
  const categoria = await prisma.solarCategoria.create({
    data: { nome },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { id: categoria.id };
}

export async function deleteCategoria(id: string) {
  await prisma.solarCategoria.delete({
    where: { id },
  });

  revalidatePath("/admin/ferramentas/solar");
  return { success: true };
}

// ===== ESTATÍSTICAS =====

export async function getSolarStats() {
  const [
    totalOrcamentos,
    orcamentosAprovados,
    orcamentosConcluidos,
    valorTotal,
  ] = await Promise.all([
    prisma.solarOrcamento.count(),
    prisma.solarOrcamento.count({
      where: {
        status: {
          in: [
            "orcamento_aprovado",
            "visita_tecnica",
            "projeto_analise",
            "instalacao_agendada",
            "instalacao_andamento",
            "instalacao_concluida",
            "homologacao",
            "concluido",
          ],
        },
      },
    }),
    prisma.solarOrcamento.count({
      where: { status: "concluido" },
    }),
    prisma.solarOrcamento.aggregate({
      _sum: { custoSistema: true },
      where: {
        status: {
          in: ["orcamento_aprovado", "concluido"],
        },
      },
    }),
  ]);

  // Orçamentos por status
  const orcamentosPorStatus = await prisma.solarOrcamento.groupBy({
    by: ["status"],
    _count: true,
  });

  // Orçamentos dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orcamentosRecentes = await prisma.solarOrcamento.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  return {
    totalOrcamentos,
    orcamentosAprovados,
    orcamentosConcluidos,
    valorTotal: Number(valorTotal._sum.custoSistema || 0),
    orcamentosPorStatus: orcamentosPorStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    orcamentosRecentes,
  };
}

// ===== ARQUIVOS =====

export async function getArquivos(orcamentoId: number) {
  const arquivos = await prisma.solarArquivo.findMany({
    where: { orcamentoId },
    orderBy: { createdAt: "desc" },
  });

  return arquivos;
}

export async function getArquivosCount(orcamentoId: number) {
  return prisma.solarArquivo.count({
    where: { orcamentoId },
  });
}
