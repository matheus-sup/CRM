"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Check if a tool is enabled for the user
export async function isToolEnabled(toolSlug: string, userId: string = "demo-user-id"): Promise<boolean> {
  const actualUserId = userId === "demo-user-id" ? TEST_USER_ID : userId;

  const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } });
  if (!tool) return false;

  const purchase = await prisma.toolPurchase.findUnique({
    where: { userId_toolId: { userId: actualUserId, toolId: tool.id } },
  });

  return purchase?.isEnabled === true;
}

// TEMPORÁRIO: ID do usuário de teste para desenvolvimento
const TEST_USER_ID = "test-user-dev";

// Garante que existe um usuário de teste para desenvolvimento
async function ensureTestUser() {
  const existing = await prisma.user.findUnique({ where: { id: TEST_USER_ID } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        name: "Usuário de Teste",
        email: "teste@naautomation.com",
        role: "ADMIN",
      },
    });
  }
  return TEST_USER_ID;
}

// Get all available tools
export async function getTools() {
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  return tools.map((tool) => ({
    ...tool,
    price: Number(tool.price),
    features: tool.features ? JSON.parse(tool.features) : [],
    configSchema: tool.configSchema ? JSON.parse(tool.configSchema) : null,
  }));
}

// Get user's purchased/enabled tools
// TEMPORÁRIO: Se userId for "demo-user-id", usa o usuário de teste
export async function getUserTools(userId: string) {
  const actualUserId = userId === "demo-user-id" ? TEST_USER_ID : userId;

  const purchases = await prisma.toolPurchase.findMany({
    where: { userId: actualUserId },
    include: { tool: true },
  });

  // Converte Decimal para Number para serialização
  // Usando JSON.parse(JSON.stringify()) para garantir serialização completa
  const serialized = purchases.map((p) => ({
    id: p.id,
    userId: p.userId,
    toolId: p.toolId,
    config: p.config,
    paidAmount: Number(p.paidAmount),
    isPlanIncluded: p.isPlanIncluded,
    isEnabled: p.isEnabled,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    tool: {
      id: p.tool.id,
      slug: p.tool.slug,
      name: p.tool.name,
      description: p.tool.description,
      icon: p.tool.icon,
      category: p.tool.category,
      price: Number(p.tool.price),
      features: p.tool.features ? JSON.parse(p.tool.features) : [],
      isActive: p.tool.isActive,
      order: p.tool.order,
    },
  }));

  // Força serialização completa para evitar objetos Decimal
  return JSON.parse(JSON.stringify(serialized));
}

// TEMPORÁRIO: Obtém as ferramentas do usuário de teste
export async function getTestUserTools() {
  return getUserTools("demo-user-id");
}

// Get user's subscription plan
export async function getUserPlan(userId: string) {
  const plan = await prisma.userPlan.findUnique({
    where: { userId },
  });

  return plan || { plan: "STARTER", isActive: true };
}

// Purchase/enable a tool
// TEMPORÁRIO: Se userId for "demo-user-id", usa o usuário de teste
export async function purchaseTool(userId: string, toolId: string) {
  // TEMPORÁRIO: Usa usuário de teste se não houver autenticação
  const actualUserId = userId === "demo-user-id" ? await ensureTestUser() : userId;

  const tool = await prisma.tool.findUnique({ where: { id: toolId } });
  if (!tool) throw new Error("Ferramenta não encontrada");

  const userPlan = await getUserPlan(actualUserId);
  const isProfessional = userPlan.plan === "PROFESSIONAL" || userPlan.plan === "ENTERPRISE";

  // Check if already purchased
  const existing = await prisma.toolPurchase.findUnique({
    where: { userId_toolId: { userId: actualUserId, toolId } },
  });

  if (existing) {
    throw new Error("Você já possui esta ferramenta");
  }

  const purchase = await prisma.toolPurchase.create({
    data: {
      userId: actualUserId,
      toolId,
      paidAmount: isProfessional ? 0 : tool.price,
      isPlanIncluded: isProfessional,
      isEnabled: true,
    },
    include: { tool: true },
  });

  revalidatePath("/admin/ferramentas");

  // Serializa para evitar erro de Decimal
  return {
    id: purchase.id,
    userId: purchase.userId,
    toolId: purchase.toolId,
    paidAmount: Number(purchase.paidAmount),
    isPlanIncluded: purchase.isPlanIncluded,
    isEnabled: purchase.isEnabled,
  };
}

// Toggle tool enabled/disabled
export async function toggleTool(purchaseId: string) {
  const purchase = await prisma.toolPurchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase) throw new Error("Compra não encontrada");

  const updated = await prisma.toolPurchase.update({
    where: { id: purchaseId },
    data: { isEnabled: !purchase.isEnabled },
  });

  revalidatePath("/admin/ferramentas");
  return { id: updated.id, isEnabled: updated.isEnabled };
}

// Toggle tool by toolId (TEMPORÁRIO: usa usuário de teste)
export async function toggleToolByToolId(toolId: string, userId: string = "demo-user-id") {
  const actualUserId = userId === "demo-user-id" ? TEST_USER_ID : userId;

  const purchase = await prisma.toolPurchase.findUnique({
    where: { userId_toolId: { userId: actualUserId, toolId } },
  });

  if (!purchase) throw new Error("Ferramenta não encontrada");

  const updated = await prisma.toolPurchase.update({
    where: { id: purchase.id },
    data: { isEnabled: !purchase.isEnabled },
  });

  revalidatePath("/admin/ferramentas");
  return { id: updated.id, isEnabled: updated.isEnabled };
}

// Delete tools by category (admin only)
export async function deleteToolsByCategory(category: string) {
  // Primeiro remove as compras relacionadas
  const tools = await prisma.tool.findMany({
    where: { category },
    select: { id: true },
  });

  const toolIds = tools.map((t) => t.id);

  await prisma.toolPurchase.deleteMany({
    where: { toolId: { in: toolIds } },
  });

  // Depois remove as ferramentas
  await prisma.tool.deleteMany({
    where: { category },
  });

  revalidatePath("/admin/ferramentas");
  return { success: true, deleted: tools.length };
}

// Deactivate/remove tool (TEMPORÁRIO: usa usuário de teste)
export async function deactivateTool(toolId: string, userId: string = "demo-user-id") {
  const actualUserId = userId === "demo-user-id" ? TEST_USER_ID : userId;

  const purchase = await prisma.toolPurchase.findUnique({
    where: { userId_toolId: { userId: actualUserId, toolId } },
  });

  if (!purchase) throw new Error("Ferramenta não encontrada");

  await prisma.toolPurchase.delete({
    where: { id: purchase.id },
  });

  revalidatePath("/admin/ferramentas");
  return { success: true };
}

// Update tool configuration
export async function updateToolConfig(purchaseId: string, config: Record<string, unknown>) {
  const updated = await prisma.toolPurchase.update({
    where: { id: purchaseId },
    data: { config: JSON.stringify(config) },
  });

  revalidatePath("/admin/ferramentas");
  return { id: updated.id, config: updated.config };
}

// Seed default tools (run once)
export async function seedTools() {
  const toolsData = [
    // Agendamentos
    {
      slug: "agendamentos-online",
      name: "Agendamentos Online",
      description: "Sistema completo de agendamentos para seus clientes. Ideal para salões, barbearias, clínicas e consultórios.",
      icon: "Calendar",
      category: "scheduling",
      price: 10,
      features: JSON.stringify([
        "Agenda visual com calendário",
        "Confirmação automática por WhatsApp",
        "Lembretes de compromissos",
        "Múltiplos profissionais",
        "Bloqueio de horários",
        "Integração com Google Calendar"
      ]),
      order: 1,
    },
    // Cardápios
    {
      slug: "cardapio-digital",
      name: "Cardápio Digital (QR Code)",
      description: "Cardápio digital interativo acessado por QR Code. Perfeito para restaurantes, bares e cafeterias.",
      icon: "QrCode",
      category: "menu",
      price: 10,
      features: JSON.stringify([
        "QR Code personalizado",
        "Fotos dos pratos",
        "Preços atualizados em tempo real",
        "Categorias organizadas",
        "Modo claro e escuro",
        "Destaque para promoções"
      ]),
      order: 2,
    },
    // Delivery
    {
      slug: "delivery-proprio",
      name: "Delivery Próprio",
      description: "Sistema de delivery próprio sem taxas de marketplaces. Seu cliente pede direto pelo seu site.",
      icon: "Bike",
      category: "delivery",
      price: 10,
      features: JSON.stringify([
        "Carrinho de compras",
        "Rastreamento de pedidos",
        "Pagamento online integrado",
        "Taxa de entrega por região",
        "Tempo estimado de entrega",
        "Notificações por WhatsApp"
      ]),
      order: 3,
    },
    // Comandas
    {
      slug: "comandas-digitais",
      name: "Comandas Digitais",
      description: "Sistema de comandas eletrônicas para bares e restaurantes. Agilize o atendimento nas mesas.",
      icon: "ClipboardList",
      category: "restaurant",
      price: 10,
      features: JSON.stringify([
        "Comandas por mesa",
        "Divisão de conta",
        "Impressão de pedidos na cozinha",
        "Controle de mesas abertas",
        "Histórico de consumo",
        "Gorjeta opcional"
      ]),
      order: 4,
    },
    // Reservas
    {
      slug: "reservas-mesas",
      name: "Reservas de Mesas",
      description: "Sistema de reservas para restaurantes com controle de lotação e confirmação automática.",
      icon: "Utensils",
      category: "restaurant",
      price: 10,
      features: JSON.stringify([
        "Calendário de reservas",
        "Confirmação por WhatsApp/SMS",
        "Controle de capacidade",
        "Lista de espera",
        "Preferências do cliente",
        "Histórico de visitas"
      ]),
      order: 5,
    },
    // Catálogo WhatsApp
    {
      slug: "catalogo-whatsapp",
      name: "Catálogo WhatsApp",
      description: "Catálogo de produtos integrado ao WhatsApp. Clientes pedem diretamente pelo chat.",
      icon: "MessageCircle",
      category: "sales",
      price: 10,
      features: JSON.stringify([
        "Link direto para WhatsApp",
        "Carrinho pelo chat",
        "Fotos de produtos",
        "Preços e descrições",
        "Mensagens automáticas",
        "Compartilhável em redes"
      ]),
      order: 6,
    },
    // Programa de Fidelidade
    {
      slug: "programa-fidelidade",
      name: "Programa de Fidelidade",
      description: "Fidelize seus clientes com pontos, cashback e recompensas. Aumente a recorrência de compras.",
      icon: "Award",
      category: "marketing",
      price: 10,
      features: JSON.stringify([
        "Acúmulo de pontos",
        "Cashback configurável",
        "Níveis de fidelidade",
        "Recompensas personalizadas",
        "Aniversário do cliente",
        "Relatórios de engajamento"
      ]),
      order: 7,
    },
    // Avaliações
    {
      slug: "avaliacoes-reviews",
      name: "Avaliações e Reviews",
      description: "Colete avaliações dos clientes e exiba no seu site. Aumente a confiança e conversão.",
      icon: "Star",
      category: "marketing",
      price: 10,
      features: JSON.stringify([
        "Avaliações com estrelas",
        "Fotos de clientes",
        "Moderação de reviews",
        "Widget para o site",
        "E-mail automático pós-compra",
        "Integração com Google"
      ]),
      order: 8,
    },
    // Orçamentos
    {
      slug: "orcamentos-online",
      name: "Orçamentos Online",
      description: "Sistema de orçamentos e propostas comerciais. Ideal para serviços e projetos sob medida.",
      icon: "FileText",
      category: "sales",
      price: 10,
      features: JSON.stringify([
        "Formulário de solicitação",
        "Templates de proposta",
        "Envio por e-mail",
        "Assinatura digital",
        "Histórico de orçamentos",
        "Conversão em pedido"
      ]),
      order: 9,
    },
    // Gift Cards
    {
      slug: "gift-cards",
      name: "Gift Cards / Vales-Presente",
      description: "Venda vales-presente digitais. Ótimo para datas especiais e presentear.",
      icon: "Gift",
      category: "sales",
      price: 10,
      features: JSON.stringify([
        "Valores personalizados",
        "Design customizado",
        "Envio por e-mail",
        "Código único",
        "Validade configurável",
        "Saldo parcial"
      ]),
      order: 10,
    },
    // Lista de Presentes
    {
      slug: "lista-presentes",
      name: "Lista de Presentes",
      description: "Listas de presentes para casamentos, chás de bebê e outras ocasiões especiais.",
      icon: "Heart",
      category: "sales",
      price: 10,
      features: JSON.stringify([
        "Listas personalizadas",
        "Link compartilhável",
        "Cotas de presentes",
        "Notificação de compras",
        "Mensagens para noivos",
        "Controle de entregas"
      ]),
      order: 11,
    },
    // Assinaturas
    {
      slug: "clube-assinaturas",
      name: "Clube de Assinaturas",
      description: "Crie clubes de assinatura com entregas recorrentes. Receita previsível todo mês.",
      icon: "RefreshCw",
      category: "sales",
      price: 10,
      features: JSON.stringify([
        "Planos mensais/anuais",
        "Produtos recorrentes",
        "Gestão de assinantes",
        "Cobrança automática",
        "Pausar/cancelar",
        "Relatórios de MRR"
      ]),
      order: 12,
    },
    // Chat WhatsApp
    {
      slug: "chat-whatsapp",
      name: "Chat WhatsApp",
      description: "Central de atendimento via WhatsApp com IA. Automatize respostas e gerencie conversas.",
      icon: "MessageSquare",
      category: "support",
      price: 15,
      features: JSON.stringify([
        "Integração com WhatsApp Business",
        "Bot com inteligência artificial",
        "Respostas automáticas",
        "Regras personalizadas",
        "Histórico de conversas",
        "Notificações em tempo real",
        "Transferência para humano",
        "Horário de atendimento"
      ]),
      order: 13,
    },
    // Venda de Lentes - Óticas
    {
      slug: "venda-lentes-oticas",
      name: "Venda de Lentes - Óticas",
      description: "Sistema completo para venda de lentes de grau. Ideal para óticas e lojas de óculos.",
      icon: "Glasses",
      category: "optics",
      price: 10,
      features: JSON.stringify([
        "Seleção de tipo de lente (grau/sem grau)",
        "Espessuras configuráveis (1.56, 1.59, 1.67, 1.74)",
        "Tratamentos (anti-reflexo, filtro azul)",
        "Preços dinâmicos por opção",
        "Modal interativo para escolha",
        "Resumo detalhado do pedido",
        "Envio de receita após compra",
        "Cores e textos personalizáveis"
      ]),
      order: 14,
    },
  ];

  for (const tool of toolsData) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool,
    });
  }

  revalidatePath("/admin/ferramentas");
  return { success: true, count: toolsData.length };
}

